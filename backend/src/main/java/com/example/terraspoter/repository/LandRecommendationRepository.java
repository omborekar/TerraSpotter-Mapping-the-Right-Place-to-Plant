// com/example/terraspoter/repository/LandRecommendationRepository.java
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for land recommendation records.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.LandRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandRecommendationRepository extends JpaRepository<LandRecommendation, Long> {
    List<LandRecommendation> findByLandId(Long landId);
    void deleteByLandId(Long landId);
}