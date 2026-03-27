// com/example/terraspoter/model/LandReview.java
package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "land_reviews")
public class LandReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long landId;
    private Long userId;

    private Integer rating;
    private String feasibilityNote;
    private String permissionNote;

    @Column(length = 2000)
    private String body;

    // filled manually in service — never persisted
    @Transient
    private String userName;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}