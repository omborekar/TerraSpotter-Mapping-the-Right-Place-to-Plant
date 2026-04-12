/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for UserBadge — tracks which badges each user has earned.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserId(Long userId);

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);

    long countByUserId(Long userId);
}
