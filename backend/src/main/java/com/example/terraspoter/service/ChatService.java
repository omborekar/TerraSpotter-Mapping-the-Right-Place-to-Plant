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

    public com.example.terraspoter.dto.ChatResponse processChat(String message, List<ChatRequest.Message> history, Long userId) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return new com.example.terraspoter.dto.ChatResponse("Error: Gemini API key is not configured.", null);
        }

        List<com.example.terraspoter.dto.LandTile> associatedLands = null;
        String redirectUrl = null;

        try {
            // First call to Gemini with tools
            ObjectNode requestBody = buildInitialRequest(message, history);
            HttpResponse<String> response = sendToGemini(requestBody);
            
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidate = getFirstCandidate(root);

            if (candidate == null) {
                return new com.example.terraspoter.dto.ChatResponse("I couldn't process that request at the moment.", null);
            }

            JsonNode content = candidate.path("content");
            JsonNode parts = content.path("parts");

            // Check if it's a function call
            if (parts.isArray() && parts.size() > 0 && parts.get(0).has("functionCall")) {
                JsonNode functionCall = parts.get(0).get("functionCall");
                String toolName = functionCall.get("name").asText();
                JsonNode args = functionCall.get("args");

                logger.info("Gemini requested tool call: " + toolName);

                // Execute tool
                Object toolResult = executeTool(toolName, args, userId);
                
                if ("getUserLands".equals(toolName) && toolResult instanceof List) {
                    associatedLands = (List<com.example.terraspoter.dto.LandTile>) toolResult;
                }

                if ("redirectToPage".equals(toolName)) {
                    String page = args.path("page").asText();
                    if ("main".equalsIgnoreCase(page)) {
                        redirectUrl = "/main";
                    } else if ("browse".equalsIgnoreCase(page)) {
                        redirectUrl = "/browse";
                    } else if (page.startsWith("/lands/")) {
                        redirectUrl = page;
                    } else {
                        redirectUrl = page;
                    }
                }

                // Send result back to Gemini
                ObjectNode followUpRequest = buildFollowUpRequest(requestBody, content, toolName, toolResult);
                HttpResponse<String> followUpResponse = sendToGemini(followUpRequest);

                JsonNode followUpRoot = objectMapper.readTree(followUpResponse.body());
                JsonNode finalCandidate = getFirstCandidate(followUpRoot);
                if (finalCandidate != null && finalCandidate.path("content").path("parts").isArray()) {
                    String finalReply = finalCandidate.path("content").path("parts").get(0).path("text").asText("No text response");
                    return new com.example.terraspoter.dto.ChatResponse(finalReply, associatedLands, redirectUrl);
                }
            }

            // Normal text response
            if (parts.isArray() && parts.size() > 0 && parts.get(0).has("text")) {
                return new com.example.terraspoter.dto.ChatResponse(parts.get(0).get("text").asText(), associatedLands, redirectUrl);
            }

            return new com.example.terraspoter.dto.ChatResponse("I am unable to answer right now.", null);

        } catch (Exception e) {
            logger.log(Level.SEVERE, "Chat processing failed", e);
            return new com.example.terraspoter.dto.ChatResponse("Sorry, I encountered an internal error while processing your request.", null);
        }
    }

    private Object executeTool(String toolName, JsonNode args, Long userId) {
        try {
            switch (toolName) {
                case "getUserLands":
                    List<Land> lands = landService.getLandsByUser(userId);
                    return lands.stream().map(l -> {
                        String imageUrl = null;
                        var images = landService.getImagesByLandId(l.getId());
                        if (images != null && !images.isEmpty()) {
                            imageUrl = images.get(0).getImageUrl();
                        }
                        return new com.example.terraspoter.dto.LandTile(
                            l.getId(),
                            l.getTitle(),
                            l.getDescription(),
                            l.getAreaSqm(),
                            l.getLandStatus(),
                            imageUrl
                        );
                    }).toList();
                
                case "getRecommendations":
                    if (!args.has("landId")) return "Error: landId missing";
                    Long landId = args.get("landId").asLong();
                    // Basic security: Check if land belongs to user
                    if (landService.getLandsByUser(userId).stream().noneMatch(l -> l.getId().equals(landId))) {
                        return "Error: Land not found or access denied.";
                    }
                    List<LandRecommendation> recs = recommendationRepository.findByLandId(landId);
                    return recs.isEmpty() ? "No recommendations found. Try refreshRecommendations." : recs;

                case "refreshRecommendations":
                    if (!args.has("landId")) return "Error: landId missing";
                    Long lId = args.get("landId").asLong();
                    if (landService.getLandsByUser(userId).stream().noneMatch(l -> l.getId().equals(lId))) {
                        return "Error: Land not found or access denied.";
                    }
                    return landService.refreshRecommendations(lId);

                case "redirectToPage":
                    if (!args.has("page")) return "Error: page argument missing";
                    String page = args.get("page").asText();
                    return "Redirection to page " + page + " initiated.";

                default:
                    return "Error: Unknown tool " + toolName;
            }
        } catch (Exception e) {
            logger.log(Level.WARNING, "Tool execution failed: " + toolName, e);
            return "Error executing tool: " + e.getMessage();
        }
    }

    private HttpResponse<String> sendToGemini(ObjectNode requestBody) throws IOException, InterruptedException {
        String url = geminiApiUrl + "?key=" + geminiApiKey;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private ObjectNode buildInitialRequest(String userMessage, List<com.example.terraspoter.dto.ChatRequest.Message> history) {
        ObjectNode request = objectMapper.createObjectNode();

        // System Instruction
        ObjectNode systemInstruction = objectMapper.createObjectNode();
        ArrayNode sysParts = systemInstruction.putArray("parts");
        sysParts.addObject().put("text", "You are TerraSpotter AI assistant. " +
                "Help users with plantation decisions. " +
                "Use tools when data or actions are needed (e.g. to get user lands, recommendations, or to redirect/navigate). " +
                "Do not guess user data. " +
                "Always prefer API results over assumptions. " +
                "Be conversational and encouraging, add emojis where appropriate. " +
                "When the user requests to list or show their lands, use the getUserLands tool. In your text response, do NOT list the lands in markdown or bullet points or duplicate their details (like names, IDs, area, status), because the UI will automatically render them as beautiful cards below your response. Just provide a friendly greeting or intro statement indicating the lands are displayed below. " +
                "When the user wants to see nearby lands ('lands near me' etc), register or report a land ('report this land' etc), or start a plantation ('start plantation on land 21' etc), call the redirectToPage tool with the appropriate page ('browse', 'main', or '/lands/{id}' respectively).");
        request.set("systemInstruction", systemInstruction);

        // Contents
        ArrayNode contents = request.putArray("contents");
        if (history != null) {
            boolean foundFirstUser = false;
            for (var m : history) {
                if (m.getText() == null || m.getText().trim().isEmpty()) {
                    continue;
                }
                String role = m.getRole();
                if ("user".equalsIgnoreCase(role)) {
                    foundFirstUser = true;
                }
                if (!foundFirstUser) {
                    continue;
                }
                ObjectNode turn = contents.addObject();
                turn.put("role", "assistant".equalsIgnoreCase(role) ? "model" : "user");
                turn.putArray("parts").addObject().put("text", m.getText());
            }
        }

        ObjectNode userTurn = contents.addObject();
        userTurn.put("role", "user");
        userTurn.putArray("parts").addObject().put("text", userMessage);

        // Tools
        ArrayNode tools = request.putArray("tools");
        ObjectNode toolObj = tools.addObject();
        ArrayNode funcDecls = toolObj.putArray("functionDeclarations");

        // Tool: getUserLands
        ObjectNode getUserLands = funcDecls.addObject();
        getUserLands.put("name", "getUserLands");
        getUserLands.put("description", "Fetch all lands of the logged in user");

        // Tool: getRecommendations
        ObjectNode getRecs = funcDecls.addObject();
        getRecs.put("name", "getRecommendations");
        getRecs.put("description", "Get plant recommendations for a specific land ID");
        ObjectNode recsParams = getRecs.putObject("parameters");
        recsParams.put("type", "OBJECT");
        ObjectNode recsProps = recsParams.putObject("properties");
        ObjectNode recsLandId = recsProps.putObject("landId");
        recsLandId.put("type", "STRING");
        recsLandId.put("description", "The ID of the land to get recommendations for");
        recsParams.putArray("required").add("landId");

        // Tool: refreshRecommendations
        ObjectNode refreshRecs = funcDecls.addObject();
        refreshRecs.put("name", "refreshRecommendations");
        refreshRecs.put("description", "Refresh or generate new ML plant recommendations for a land ID");
        ObjectNode refParams = refreshRecs.putObject("parameters");
        refParams.put("type", "OBJECT");
        ObjectNode refProps = refParams.putObject("properties");
        ObjectNode refLandId = refProps.putObject("landId");
        refLandId.put("type", "STRING");
        refLandId.put("description", "The ID of the land to refresh recommendations for");
        refParams.putArray("required").add("landId");

        // Tool: redirectToPage
        ObjectNode redirectToPage = funcDecls.addObject();
        redirectToPage.put("name", "redirectToPage");
        redirectToPage.put("description", "Redirect the user to a specific page on the platform. Use this when the user wants to see lands near them (page: 'browse'), report or register a new land (page: 'main'), or start a plantation on a specific land (page: '/lands/{id}' where {id} is the land ID).");
        ObjectNode redirectParams = redirectToPage.putObject("parameters");
        redirectParams.put("type", "OBJECT");
        ObjectNode redirectProps = redirectParams.putObject("properties");
        ObjectNode redirectPage = redirectProps.putObject("page");
        redirectPage.put("type", "STRING");
        redirectPage.put("description", "The target page/route name, e.g. 'main', 'browse', or '/lands/{id}'");
        redirectParams.putArray("required").add("page");

        return request;
    }

    private ObjectNode buildFollowUpRequest(ObjectNode originalRequest, JsonNode modelReplyContent, String toolName, Object toolResult) {
        ObjectNode followUpRequest = originalRequest.deepCopy();
        ArrayNode contents = (ArrayNode) followUpRequest.get("contents");

        // Append model's tool call reply
        contents.add(modelReplyContent);

        // Append tool response
        ObjectNode toolResponseTurn = contents.addObject();
        toolResponseTurn.put("role", "function");
        
        ArrayNode parts = toolResponseTurn.putArray("parts");
        ObjectNode toolResponsePart = parts.addObject();
        ObjectNode functionResponse = toolResponsePart.putObject("functionResponse");
        functionResponse.put("name", toolName);
        
        ObjectNode responseMap = functionResponse.putObject("response");
        responseMap.put("name", toolName);
        responseMap.set("content", objectMapper.valueToTree(toolResult));

        return followUpRequest;
    }

    private JsonNode getFirstCandidate(JsonNode root) {
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            return candidates.get(0);
        }
        return null;
    }
}
