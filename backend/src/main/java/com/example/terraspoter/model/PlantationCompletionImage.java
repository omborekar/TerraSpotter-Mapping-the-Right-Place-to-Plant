/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Entity for images attached to plantation completions.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "plantation_completion_images")
public class PlantationCompletionImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ RELATION instead of plain Long
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completion_id", nullable = false)
    private PlantationCompletion completionId;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}