package com.example.terraspoter.service;

import com.example.terraspoter.repository.LandRecommendationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private LandService landService;

    @Mock
    private LandRecommendationRepository recommendationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(landService, recommendationRepository, objectMapper);
    }

    @Test
    void testBuildInitialRequest_ToolParameterTypesAreLowercase() {
        ObjectNode requestBody = chatService.buildInitialRequest("hello", Collections.emptyList());
        assertNotNull(requestBody);

        JsonNode tools = requestBody.path("tools");
        assertTrue(tools.isArray());
        assertTrue(tools.size() > 0);

        JsonNode funcDecls = tools.get(0).path("functionDeclarations");
        assertTrue(funcDecls.isArray());
        assertTrue(funcDecls.size() > 0);

        for (JsonNode decl : funcDecls) {
            if (decl.has("parameters")) {
                JsonNode params = decl.get("parameters");
                String paramType = params.path("type").asText();
                assertEquals("object", paramType, "Parameter block type must be 'object' (lowercase)");

                JsonNode properties = params.path("properties");
                assertFalse(properties.isMissingNode());

                properties.fields().forEachRemaining(entry -> {
                    String propType = entry.getValue().path("type").asText();
                    assertEquals("string", propType, "Property type must be 'string' (lowercase)");
                });
            }
        }
    }
}
