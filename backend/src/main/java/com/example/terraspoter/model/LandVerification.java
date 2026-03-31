package com.example.terraspoter.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "land_verifications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"land_id", "user_id"})
)
public class LandVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "land_id", nullable = false)
    private Long landId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String vote; // APPROVE / REJECT

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // 🔽 getters & setters

    public Long getId() { return id; }

    public Long getLandId() { return landId; }
    public void setLandId(Long landId) { this.landId = landId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getVote() { return vote; }
    public void setVote(String vote) { this.vote = vote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}