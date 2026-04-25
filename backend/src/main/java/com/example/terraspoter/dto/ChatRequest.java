package com.example.terraspoter.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private String message;
    private List<Message> history;

    @Data
    public static class Message {
        private String role;
        private String text;
    }
}
