/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Entity representing a gamification badge definition.
*/
package com.example.terraspoter.model;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_code")
    private String iconCode;

    @Column(name = "trigger_type")
    private String triggerType;   // e.g. ADD_LAND, COMPLETE_PLANTATION, TOTAL_TREES, STREAK

    @Column(name = "threshold")
    private int threshold;        // numeric trigger threshold (quantity)

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconCode() { return iconCode; }
    public void setIconCode(String iconCode) { this.iconCode = iconCode; }

    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }

    public int getThreshold() { return threshold; }
    public void setThreshold(int threshold) { this.threshold = threshold; }
}
