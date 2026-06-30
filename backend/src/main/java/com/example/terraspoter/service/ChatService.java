package com.example.terraspoter.service;

import com.example.terraspoter.model.Land;
import com.example.terraspoter.model.LandRecommendation;
import com.example.terraspoter.repository.LandRecommendationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import com.example.terraspoter.dto.ChatRequest;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger logger = Logger.getLogger(ChatService.class.getName());

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String geminiApiUrl;

    private final LandService landService;
    private final LandRecommendationRepository recommendationRepository;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public com.example.terraspoter.dto.ChatResponse processChat(
            String message,
            List<ChatRequest.Message> history,
            Long userId) {

        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return new com.example.terraspoter.dto.ChatResponse(
                    "Error: Gemini API key is not configured.", null);
        }

        List<com.example.terraspoter.dto.LandTile> associatedLands = null;
        String redirectUrl = null;

        try {
            ObjectNode requestBody = buildInitialRequest(message, history);
            HttpResponse<String> response = sendToGemini(requestBody);

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidate = getFirstCandidate(root);

            if (candidate == null) {
                return new com.example.terraspoter.dto.ChatResponse(
                        "I couldn't process that request at the moment.", null);
            }

            JsonNode content = candidate.path("content");
            JsonNode parts = content.path("parts");

            // ── Function call branch ──────────────────────────────────
            if (parts.isArray() && parts.size() > 0 && parts.get(0).has("functionCall")) {
                JsonNode functionCall = parts.get(0).get("functionCall");
                String toolName = functionCall.get("name").asText();
                JsonNode args = functionCall.get("args");

                logger.info("Gemini tool call: " + toolName + " args=" + args);

                Object toolResult = executeTool(toolName, args, userId);

                // ── Side-effects per tool ─────────────────────────────
                switch (toolName) {
                    case "getUserLands":
                        if (toolResult instanceof List) {
                            associatedLands = (List<com.example.terraspoter.dto.LandTile>) toolResult;
                        }
                        break;

                    case "getLandByName":
                        if (toolResult instanceof com.example.terraspoter.dto.LandTile found) {
                            associatedLands = List.of(found);
                            redirectUrl = "/lands/" + found.getId();
                        }
                        break;

                    case "navigateToLand": {
                        String landIdStr = args.path("landId").asText();
                        if (!landIdStr.isBlank()) {
                            redirectUrl = "/lands/" + landIdStr;
                        }
                        break;
                    }

                    case "redirectToPage": {
                        String page = args.path("page").asText();
                        redirectUrl = normalizePage(page);
                        break;
                    }
                }

                // ── Follow-up to get final text ───────────────────────
                ObjectNode followUp = buildFollowUpRequest(requestBody, content, toolName, toolResult);
                HttpResponse<String> followUpResp = sendToGemini(followUp);

                JsonNode followRoot = objectMapper.readTree(followUpResp.body());
                JsonNode finalCandidate = getFirstCandidate(followRoot);
                if (finalCandidate != null && finalCandidate.path("content").path("parts").isArray()) {
                    String finalReply = finalCandidate.path("content").path("parts")
                            .get(0).path("text").asText("No text response");
                    return new com.example.terraspoter.dto.ChatResponse(
                            finalReply, associatedLands, redirectUrl);
                }
            }

            // ── Plain text response ───────────────────────────────────
            if (parts.isArray() && parts.size() > 0 && parts.get(0).has("text")) {
                return new com.example.terraspoter.dto.ChatResponse(
                        parts.get(0).get("text").asText(), associatedLands, redirectUrl);
            }

            return new com.example.terraspoter.dto.ChatResponse("I am unable to answer right now.", null);

        } catch (Exception e) {
            logger.log(Level.SEVERE, "Chat processing failed", e);
            return new com.example.terraspoter.dto.ChatResponse(
                    "Sorry, I encountered an internal error while processing your request.", null);
        }
    }

    // ── Normalize page name to a valid route ─────────────────────────────────
    private String normalizePage(String page) {
        if (page == null) return null;
        String p = page.trim().toLowerCase();
        if (p.equals("main") || p.equals("/main")) return "/Main";
        if (p.equals("browse") || p.equals("/browse")) return "/browse";
        if (p.startsWith("/lands/")) return page;
        if (p.startsWith("lands/")) return "/" + page;
        return page;
    }

    // ── Tool execution ────────────────────────────────────────────────────────
    private Object executeTool(String toolName, JsonNode args, Long userId) {
        try {
            switch (toolName) {

                case "getUserLands": {
                    List<Land> lands = landService.getLandsByUser(userId);
                    return lands.stream().map(l -> {
                        String imageUrl = null;
                        var images = landService.getImagesByLandId(l.getId());
                        if (images != null && !images.isEmpty()) imageUrl = images.get(0).getImageUrl();
                        return new com.example.terraspoter.dto.LandTile(
                                l.getId(), l.getTitle(), l.getDescription(),
                                l.getAreaSqm(), l.getLandStatus(), imageUrl);
                    }).toList();
                }

                case "getLandByName": {
                    if (!args.has("name")) return "Error: name argument missing";
                    String searchName = args.get("name").asText().trim().toLowerCase();
                    List<Land> userLands = landService.getLandsByUser(userId);

                    // Exact match first, then contains
                    Optional<Land> match = userLands.stream()
                            .filter(l -> l.getTitle() != null
                                    && l.getTitle().trim().toLowerCase().equals(searchName))
                            .findFirst();
                    if (match.isEmpty()) {
                        match = userLands.stream()
                                .filter(l -> l.getTitle() != null
                                        && l.getTitle().trim().toLowerCase().contains(searchName))
                                .findFirst();
                    }
                    if (match.isEmpty()) {
                        return "No land found matching '" + args.get("name").asText()
                                + "'. Try listing your lands first with 'show my lands'.";
                    }
                    Land l = match.get();
                    String imageUrl = null;
                    var images = landService.getImagesByLandId(l.getId());
                    if (images != null && !images.isEmpty()) imageUrl = images.get(0).getImageUrl();
                    return new com.example.terraspoter.dto.LandTile(
                            l.getId(), l.getTitle(), l.getDescription(),
                            l.getAreaSqm(), l.getLandStatus(), imageUrl);
                }

                case "navigateToLand": {
                    if (!args.has("landId")) return "Error: landId argument missing";
                    return "Navigating to land " + args.get("landId").asText() + ".";
                }

                case "getRecommendations": {
                    if (!args.has("landId")) return "Error: landId missing";
                    Long landId = args.get("landId").asLong();
                    if (landService.getLandsByUser(userId).stream().noneMatch(l -> l.getId().equals(landId))) {
                        return "Error: Land not found or access denied.";
                    }
                    List<LandRecommendation> recs = recommendationRepository.findByLandId(landId);
                    return recs.isEmpty() ? "No recommendations found. Try refreshRecommendations." : recs;
                }

                case "refreshRecommendations": {
                    if (!args.has("landId")) return "Error: landId missing";
                    Long lId = args.get("landId").asLong();
                    if (landService.getLandsByUser(userId).stream().noneMatch(l -> l.getId().equals(lId))) {
                        return "Error: Land not found or access denied.";
                    }
                    return landService.refreshRecommendations(lId);
                }

                case "redirectToPage": {
                    if (!args.has("page")) return "Error: page argument missing";
                    return "Navigating to " + args.get("page").asText() + ".";
                }

                default:
                    return "Error: Unknown tool " + toolName;
            }
        } catch (Exception e) {
            logger.log(Level.WARNING, "Tool execution failed: " + toolName, e);
            return "Error executing tool: " + e.getMessage();
        }
    }

    // ── HTTP helper ───────────────────────────────────────────────────────────
    private HttpResponse<String> sendToGemini(ObjectNode requestBody) throws IOException, InterruptedException {
        String url = geminiApiUrl + "?key=" + geminiApiKey;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    // ── Build first Gemini request ────────────────────────────────────────────
    ObjectNode buildInitialRequest(
            String userMessage,
            List<com.example.terraspoter.dto.ChatRequest.Message> history) {

        ObjectNode request = objectMapper.createObjectNode();

        // System instruction
        ObjectNode si = objectMapper.createObjectNode();
        si.putArray("parts").addObject().put("text",
            "You are TerraSpotter AI — a friendly, knowledgeable plantation assistant.\n\n" +

            "TOOL USAGE RULES:\n" +
            "1. getUserLands — call this when the user wants to list, show, or see all their lands. " +
            "   After calling it, do NOT repeat the land names/IDs/areas in text. " +
            "   Just say something brief like 'Here are your lands!' The UI renders them as clickable cards.\n" +
            "2. getLandByName(name) — call this when the user asks about a SPECIFIC land by name, " +
            "   e.g. 'tell me about Pune Green', 'show Sawargaon Wadi land', 'what is Delhi Ridge?'. " +
            "   After calling it, just briefly say the land was found and that they can click the button to view it. " +
            "   Do NOT repeat land details from the result in text.\n" +
            "3. navigateToLand(landId) — call this when the user explicitly says 'go to land 21', " +
            "   'open land 4', 'navigate to land 7', or asks to view/open a specific land by ID.\n" +
            "4. redirectToPage(page) — use for: " +
            "   'lands near me'/'nearby lands' -> page='browse'; " +
            "   'report a land'/'register land'/'submit land' -> page='main'; " +
            "   'start plantation on land {id}' -> page='/lands/{id}'.\n" +
            "5. getRecommendations(landId) / refreshRecommendations(landId) — for plant recommendations.\n\n" +
            "STYLE: Be warm, concise, add relevant emojis. Never use markdown bold (**), bullet lists, or asterisks."
        );
        request.set("systemInstruction", si);

        // Conversation history
        ArrayNode contents = request.putArray("contents");
        if (history != null) {
            boolean foundFirstUser = false;
            for (var m : history) {
                if (m.getText() == null || m.getText().trim().isEmpty()) continue;
                if ("user".equalsIgnoreCase(m.getRole())) foundFirstUser = true;
                if (!foundFirstUser) continue;
                ObjectNode turn = contents.addObject();
                turn.put("role", "assistant".equalsIgnoreCase(m.getRole()) ? "model" : "user");
                turn.putArray("parts").addObject().put("text", m.getText());
            }
        }
        contents.addObject()
                .put("role", "user")
                .putArray("parts").addObject().put("text", userMessage);

        // Tool declarations
        ArrayNode tools = request.putArray("tools");
        ArrayNode funcDecls = tools.addObject().putArray("functionDeclarations");

        addTool(funcDecls, "getUserLands",
                "Fetch all registered lands belonging to the logged-in user.", null);

        addTool(funcDecls, "getLandByName",
                "Look up a specific user land by name. Call when user mentions a land name e.g. 'tell me about Pune Green'.",
                param("name", "STRING", "Land name or partial name to search for", true));

        addTool(funcDecls, "navigateToLand",
                "Navigate to a specific land detail page by ID. Call when user says 'go to land 21', 'open land 4'.",
                param("landId", "STRING", "The numeric ID of the land to navigate to", true));

        addTool(funcDecls, "getRecommendations",
                "Get plant recommendations for a specific land by ID.",
                param("landId", "STRING", "The ID of the land", true));

        addTool(funcDecls, "refreshRecommendations",
                "Refresh ML-based plant recommendations for a land by ID.",
                param("landId", "STRING", "The ID of the land", true));

        addTool(funcDecls, "redirectToPage",
                "Redirect the user to a platform page. page='browse' for nearby lands, " +
                "'main' to register a new land, '/lands/{id}' for plantation on a land.",
                param("page", "STRING", "Target page: 'browse', 'main', or '/lands/{id}'", true));

        return request;
    }

    // ── Helper: add a tool with optional single param ─────────────────────────
    private void addTool(ArrayNode decls, String name, String description, String[] param) {
        ObjectNode tool = decls.addObject();
        tool.put("name", name);
        tool.put("description", description);
        if (param != null) {
            ObjectNode params = tool.putObject("parameters");
            params.put("type", "object");
            params.putObject("properties").putObject(param[0])
                    .put("type", param[1].toLowerCase())
                    .put("description", param[2]);
            if ("true".equals(param[3])) params.putArray("required").add(param[0]);
        }
    }

    private String[] param(String name, String type, String desc, boolean required) {
        return new String[]{name, type, desc, String.valueOf(required)};
    }

    // ── Build follow-up request after tool call ───────────────────────────────
    private ObjectNode buildFollowUpRequest(
            ObjectNode originalRequest,
            JsonNode modelReplyContent,
            String toolName,
            Object toolResult) {

        ObjectNode followUp = originalRequest.deepCopy();
        ArrayNode contents = (ArrayNode) followUp.get("contents");

        // Append model's tool-call turn
        contents.add(modelReplyContent);

        // Append tool response turn
        ObjectNode toolTurn = contents.addObject();
        toolTurn.put("role", "user");
        ObjectNode funcResp = toolTurn.putArray("parts").addObject()
                .putObject("functionResponse");
        funcResp.put("name", toolName);
        funcResp.putObject("response")
                .put("name", toolName)
                .set("content", objectMapper.valueToTree(toolResult));

        return followUp;
    }

    private JsonNode getFirstCandidate(JsonNode root) {
        JsonNode candidates = root.path("candidates");
        return (candidates.isArray() && candidates.size() > 0) ? candidates.get(0) : null;
    }
}
