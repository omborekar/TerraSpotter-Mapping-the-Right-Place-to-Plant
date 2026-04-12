/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for UserPoints — one row per user tracking XP and level.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.UserPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserPointsRepository extends JpaRepository<UserPoints, Long> {

    Optional<UserPoints> findByUserId(Long userId);

    // Top N users by XP for leaderboard
    @Query("SELECT u FROM UserPoints u ORDER BY u.totalXp DESC")
    List<UserPoints> findTopByXp();
}
