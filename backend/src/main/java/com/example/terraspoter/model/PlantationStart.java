// com/example/terraspoter/model/PlantationStart.java
package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "plantation_starts")
public class PlantationStart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long landId;
    private Long userId;

    private LocalDate plannedDate;
    private Integer teamSize;
    private Integer treesToPlant;
    private String method;

    @Column(length = 1000)
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}