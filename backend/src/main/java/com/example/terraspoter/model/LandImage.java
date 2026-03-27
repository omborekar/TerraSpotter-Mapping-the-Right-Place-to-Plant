package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "land_images")
public class LandImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long landId;

    @Column(nullable = false)
    private String imageUrl;

    @Column(updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    // Getters & Setters
}