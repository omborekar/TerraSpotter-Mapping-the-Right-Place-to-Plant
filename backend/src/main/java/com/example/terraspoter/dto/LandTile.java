package com.example.terraspoter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LandTile {
    private Long id;
    private String title;
    private String description;
    private Double areaSqm;
    private String status;
    private String imageUrl;
}
