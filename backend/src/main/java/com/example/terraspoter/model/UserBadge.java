/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Join entity representing a badge earned by a specific user.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_badges",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "badge_id"})
)
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "badge_id", nullable = false)
    private Long badgeId;

    @Column(name = "earned_at", updatable = false)
    private LocalDateTime earnedAt = LocalDateTime.now();

    // Transient: populated at query time
    @Transient
    private String badgeName;
    @Transient
    private String badgeDescription;
    @Transient
    private String badgeIcon;

    // Getters and Setters

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBadgeId() { return badgeId; }
    public void setBadgeId(Long badgeId) { this.badgeId = badgeId; }

    public LocalDateTime getEarnedAt() { return earnedAt; }

    public String getBadgeName() { return badgeName; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }

    public String getBadgeDescription() { return badgeDescription; }
    public void setBadgeDescription(String badgeDescription) { this.badgeDescription = badgeDescription; }

    public String getBadgeIcon() { return badgeIcon; }
    public void setBadgeIcon(String badgeIcon) { this.badgeIcon = badgeIcon; }
}
