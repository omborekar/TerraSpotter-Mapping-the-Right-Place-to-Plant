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

        // ✅ using status instead of verified
        long approved = landRepository.countByStatus("APPROVED");

        long trees = plantationRepository.totalTreesPlanted();

        Map<String, Object> stats = new HashMap<>();
        stats.put("lands", totalLands);
        stats.put("verified", approved); // frontend same name
        stats.put("trees", trees);
        stats.put("districts", "-"); // ❌ not in DB

        return stats;
    }
}