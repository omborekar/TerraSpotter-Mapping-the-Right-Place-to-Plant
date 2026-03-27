package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "land_details")
public class Land {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String polygonCoords;

    private Double centroidLat;
    private Double centroidLng;
    private Double areaSqm;

    private String ownerName;
    private String ownerPhone;
    private String ownershipType;
    private String permissionStatus;

    private String landStatus;
    private String waterAvailable;
    private String waterFrequency;
    private Boolean fencing = false;
    // ── transient — all derived from plantation_completions at query time ──────
    @Transient private PlantationStartDetail  plantationDetail;
    @Transient private PlantationDoneDetail   completionDetail;
    @Transient private Integer remainingCapacity;   // from latest completion.more_capacity
    @Transient private Integer totalTreesPlanted;   // sum of all completions.trees_planted
    @Transient private Integer totalRounds;         // count of all completions for this land
    @Column(length = 1000)
    private String notes;

    private String status = "PENDING";

    private Long createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // extra land detail fields
    private String accessRoad;
    private String soilType;
    private String nearbyLandmark;

    // tracks who clicked "Mark as Under Plantation"
    private Long plantationUserId;



    // ── inner class: replaces PlantationStartDTO ───────────────────────────
    @Data
    public static class PlantationStartDetail {
        private Integer   teamSize;
        private Integer   treesToPlant;
        private String    method;
        private LocalDate plannedDate;
    }

    // ── inner class: replaces PlantationCompletionDTO ─────────────────────
    @Data
    public static class PlantationDoneDetail {
        private Integer treesPlanted;
        private Integer moreCapacity;
        private String  notes;
    }
}