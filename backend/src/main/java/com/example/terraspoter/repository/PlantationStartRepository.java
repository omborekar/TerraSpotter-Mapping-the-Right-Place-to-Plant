/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for plantation start records.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.PlantationStart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlantationStartRepository
        extends JpaRepository<PlantationStart, Long> {
    Optional<PlantationStart> findTopByLandIdOrderByCreatedAtDesc(Long landId);
}