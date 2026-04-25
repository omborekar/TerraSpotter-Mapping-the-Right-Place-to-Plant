package com.example.terraspoter.controller;

import com.example.terraspoter.dto.ChatRequest;
import com.example.terraspoter.dto.ChatResponse;
import com.example.terraspoter.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<?> processChat(
            @RequestBody ChatRequest request,
            HttpSession session) {
        
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }
        
        String reply = chatService.processChat(request.getMessage(), userId);
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
