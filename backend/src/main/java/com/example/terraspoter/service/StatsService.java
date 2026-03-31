package com.example.terraspoter.service;

import com.example.terraspoter.repository.LandRepository;
import com.example.terraspoter.repository.PlantationCompletionRepository;
import com.example.terraspoter.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StatsService {

    private final LandRepository landRepository;
    private final PlantationCompletionRepository plantationRepository;
    private final UserRepository userRepository;

    public StatsService(LandRepository landRepository,
                        PlantationCompletionRepository plantationRepository,
                        UserRepository userRepository) {
        this.landRepository       = landRepository;
        this.plantationRepository = plantationRepository;
        this.userRepository       = userRepository;
    }

    public Map<String, Object> getStats() {
        long totalLands = landRepository.countLand();
        long approved   = landRepository.countByStatus("APPROVED");
        long trees      = plantationRepository.totalTreesPlanted();
        long users      = userRepository.userCount();

        // area_sqm exists — sum approved land area in hectares (1 hectare = 10,000 sqm)
        Double totalSqm    = landRepository.sumAreaSqmByStatus("APPROVED");
        long hectaresMapped = totalSqm != null ? Math.round(totalSqm / 10_000.0) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("users",    users);
        stats.put("lands",    totalLands);
        stats.put("verified", approved);
        stats.put("trees",    trees);
        stats.put("hectares", hectaresMapped); // real area from area_sqm column
        // districts omitted — not in your schema


        return stats;
    }
}