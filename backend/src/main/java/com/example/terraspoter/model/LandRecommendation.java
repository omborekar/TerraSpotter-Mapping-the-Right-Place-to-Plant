// com/example/terraspoter/model/LandRecommendation.java
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Entity representing ML-based tree recommendations for a land.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "land_recommendations")
public class LandRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long landId;

    @Column(nullable = false)
    private String plantName;

    private Double suitabilityScore;

    @Column(length = 1000)
    private String reason;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}