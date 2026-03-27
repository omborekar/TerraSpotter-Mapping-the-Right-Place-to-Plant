// com/example/terraspoter/model/PlantationCompletion.java
package com.example.terraspoter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "plantation_completions")
public class PlantationCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long landId;
    private Long userId;

    private Integer treesPlanted;
    private Integer moreCapacity;

    @Column(length = 1000)
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}