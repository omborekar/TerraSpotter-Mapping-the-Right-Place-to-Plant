/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Entity representing a community growth update for a planted site.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "growth_updates")
public class GrowthUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "land_id", nullable = false)
    private Long landId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "average_height_cm")
    private Integer averageHeightCm;

    @Column(name = "survival_rate")
    private Integer survivalRate;

    @Column(name = "health_status")
    private String healthStatus;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "update", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<GrowthUpdateImage> images = new ArrayList<>();

    // Transient fields populated at query time
    @Transient
    private String landTitle;

    @Transient
    private String landLocation;

    @Transient
    private Integer landTreesPlanted;
}
