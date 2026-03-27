package com.example.terraspoter.repository;

import com.example.terraspoter.model.PlantationCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
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
}