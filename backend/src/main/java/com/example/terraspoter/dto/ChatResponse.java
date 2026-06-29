package com.example.terraspoter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String reply;
    private List<LandTile> lands;
    private String redirectUrl;

    public ChatResponse(String reply) {
        this.reply = reply;
    }

    public ChatResponse(String reply, List<LandTile> lands) {
        this.reply = reply;
        this.lands = lands;
    }
}
