package com.example.terraspoter.controller;

import com.example.terraspoter.dto.ChatRequest;
import com.example.terraspoter.dto.ChatResponse;
import com.example.terraspoter.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> processChat(
            @RequestBody ChatRequest request,
            Authentication authentication) {
        
        Long userId = Long.valueOf(authentication.getName());
        String reply = chatService.processChat(request.getMessage(), userId);
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
