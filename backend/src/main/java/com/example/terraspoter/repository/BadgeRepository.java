/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for Badge definitions used by the gamification engine.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    Optional<Badge> findByName(String name);

    List<Badge> findByTriggerType(String triggerType);
}
