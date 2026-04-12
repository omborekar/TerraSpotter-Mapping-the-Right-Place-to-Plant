/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Audit log entity for every XP award in the gamification system.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "xp_transactions")
public class XpTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "action", nullable = false)
    private String action;          // e.g. ADD_LAND, START_PLANTATION

    @Column(name = "xp_awarded", nullable = false)
    private int xpAwarded;

    @Column(name = "reference_id")
    private Long referenceId;       // land/plantation ID that triggered this

    @Column(name = "description")
    private String description;     // human-readable label

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public int getXpAwarded() { return xpAwarded; }
    public void setXpAwarded(int xpAwarded) { this.xpAwarded = xpAwarded; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
