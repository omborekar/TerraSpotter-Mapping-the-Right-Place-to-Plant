// com/example/terraspoter/repository/LandReviewRepository.java
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for land review entries.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.LandReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LandReviewRepository extends JpaRepository<LandReview, Long> {
    List<LandReview> findByLandIdOrderByCreatedAtDesc(Long landId);
    Optional<LandReview> findByLandIdAndUserId(Long landId, Long userId);
}