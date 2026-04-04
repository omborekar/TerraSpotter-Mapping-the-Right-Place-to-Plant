// PlantationReview.java
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Entity for plantation review entries.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plantation_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlantationReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "completion_id", nullable = false)
    private Long completionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "reviewId", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<PlantationReviewImage> images = new ArrayList<>();
}