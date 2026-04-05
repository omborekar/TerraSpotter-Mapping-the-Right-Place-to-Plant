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

    // ── EXISTING — unchanged ──────────────────────────────────────────────

    // Used by LandService.getLandById() to attach latest completion detail
    // to the Land transient field
    Optional<PlantationCompletion> findTopByLandIdOrderByCreatedAtDesc(Long landId);

    // Used by LandService to get all completions for a specific land
    List<PlantationCompletion> findByLandIdOrderByCreatedAtDesc(Long landId);

    // Used by StatsService to compute total trees planted for homepage dashboard
    @Query("SELECT COALESCE(SUM(p.treesPlanted), 0) FROM PlantationCompletion p")
    Long totalTreesPlanted();

    // ── NEW ───────────────────────────────────────────────────────────────
    // Used by PlantationShowcaseService.getCompletionsByUser()
    // which is called by PlantationController.getMyCompletions()
    // Profile.jsx fetches this to show real trees planted stats.
    // Spring Data JPA auto-generates:
    //   SELECT * FROM plantation_completions WHERE user_id = ?
    // No @Query annotation needed — method name is enough.
    List<PlantationCompletion> findByUserId(Long userId);
}