/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Entity for images attached to plantation completions.
*/
package com.example.terraspoter.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    // FIX: added @JsonIgnore to break the infinite circular reference.
    // Without it Jackson serializes:
    //   PlantationCompletion → images[] → completionId (PlantationCompletion)
    //   → images[] → completionId → ... forever
    // This caused the API to return megabytes of recursive JSON,
    // the frontend fetch to receive broken/truncated data,
    // and completions state to stay [] so stats never updated.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completion_id", nullable = false)
    private PlantationCompletion completionId;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}