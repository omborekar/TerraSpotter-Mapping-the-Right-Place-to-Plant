/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for growth update records.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.GrowthUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrowthUpdateRepository extends JpaRepository<GrowthUpdate, Long> {

    List<GrowthUpdate> findByLandIdOrderByCreatedAtDesc(Long landId);

    List<GrowthUpdate> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(DISTINCT g.landId) FROM GrowthUpdate g")
    long countDistinctLands();

    @Query("SELECT COALESCE(AVG(g.survivalRate), 0) FROM GrowthUpdate g")
    double averageSurvivalRate();
}
