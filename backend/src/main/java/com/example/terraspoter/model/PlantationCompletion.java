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
@Table(name = "plantation_completions")
public class PlantationCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "land_id")
    private Long landId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "trees_planted")
    private Integer treesPlanted;

    @Column(name = "more_capacity")
    private Integer moreCapacity;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ✅ NEW: images relation
    @OneToMany(mappedBy = "completionId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PlantationCompletionImage> images = new ArrayList<>();

    // ✅ NEW: reviews relation
    @OneToMany(mappedBy = "completionId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PlantationReview> reviews = new ArrayList<>();

    // ✅ NEW: transient fields (not stored in DB)
    @Transient
    private String landTitle;

    @Transient
    private String location;

    @Transient
    private String teamName;
}