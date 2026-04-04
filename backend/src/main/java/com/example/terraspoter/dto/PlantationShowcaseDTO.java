/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: DTO for plantation showcase entries.
*/
package com.example.terraspoter.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PlantationShowcaseDTO {

    private Long id;
    private String title;
    private String location;

    private Integer treesPlanted;
    private Integer moreCapacity;
    private LocalDateTime completedAt;
    private String notes;

    private List<String> images;
    private List<ReviewDTO> reviews;

    private String teamName;

    @Data
    public static class ReviewDTO {
        private Long id;
        private String userName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
        private List<String> images;
    }
}