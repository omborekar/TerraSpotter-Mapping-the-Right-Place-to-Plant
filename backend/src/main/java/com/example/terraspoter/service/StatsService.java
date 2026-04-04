/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Aggregates site and community statistics for frontend display.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.repository.LandRepository;
import com.example.terraspoter.repository.UserRepository;
import com.example.terraspoter.repository.PlantationCompletionRepository;

import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class StatsService {

    private final LandRepository landRepository;
    private final UserRepository userRepository;
    private final PlantationCompletionRepository plantationCompletionRepository;

    public StatsService(LandRepository landRepository,
                        UserRepository userRepository,PlantationCompletionRepository plantationCompletionRepository) {
        this.landRepository = landRepository;
        this.userRepository = userRepository;
        this.plantationCompletionRepository=plantationCompletionRepository;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put("totalLands",    landRepository.count());
        stats.put("approvedLands", landRepository.countByStatus("APPROVED"));
        stats.put("treesPlanted",  plantationCompletionRepository.totalTreesPlanted());
        stats.put("volunteers",    userRepository.count());

        return stats;
    }
}