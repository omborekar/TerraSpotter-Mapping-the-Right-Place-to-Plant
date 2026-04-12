/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Entity tracking a user's gamification XP, level, and activity streak.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_points")
public class UserPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "total_xp", nullable = false)
    private int totalXp = 0;

    @Column(name = "level", nullable = false)
    private int level = 1;

    @Column(name = "streak", nullable = false)
    private int streak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public int getTotalXp() { return totalXp; }
    public void setTotalXp(int totalXp) { this.totalXp = totalXp; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }

    public LocalDate getLastActivityDate() { return lastActivityDate; }
    public void setLastActivityDate(LocalDate lastActivityDate) { this.lastActivityDate = lastActivityDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
