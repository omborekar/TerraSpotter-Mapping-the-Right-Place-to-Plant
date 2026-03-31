package com.example.terraspoter.service;

import com.example.terraspoter.repository.LandRepository;
import com.example.terraspoter.repository.PlantationCompletionRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StatsService {

    private final LandRepository landRepository;
    private final PlantationCompletionRepository plantationRepository;

    public StatsService(LandRepository landRepository,
                        PlantationCompletionRepository plantationRepository) {
        this.landRepository = landRepository;
        this.plantationRepository = plantationRepository;
    }

    public Map<String, Object> getStats() {

        long totalLands = landRepository.count();
        long verified = landRepository.countByVerifiedTrue();
        long districts = landRepository.countDistinctDistricts();
        long trees = plantationRepository.totalTreesPlanted();

        Map<String, Object> stats = new HashMap<>();
        stats.put("lands", totalLands);
        stats.put("verified", verified);
        stats.put("districts", districts);
        stats.put("trees", trees);

        return stats;
    }
}