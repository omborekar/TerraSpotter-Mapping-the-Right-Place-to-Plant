/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for plantation completion records.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.PlantationCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface PlantationCompletionRepository
        extends JpaRepository<PlantationCompletion, Long> {
    // already exists:
    Optional<PlantationCompletion> findTopByLandIdOrderByCreatedAtDesc(Long landId);

    // ADD THIS — for aggregate totals:
    List<PlantationCompletion> findByLandIdOrderByCreatedAtDesc(Long landId);
    @Query("SELECT COALESCE(SUM(p.treesPlanted), 0) FROM PlantationCompletion p")
    Long totalTreesPlanted();
}