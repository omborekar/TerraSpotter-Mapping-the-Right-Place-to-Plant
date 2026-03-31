package com.example.terraspoter.service;

import com.example.terraspoter.repository.LandRepository;
import com.example.terraspoter.repository.PlantationCompletionRepository;
import com.example.terraspoter.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

        double totalSqm = Optional.ofNullable(
                landRepository.sumAreaSqmByStatus("APPROVED")
        ).orElse(0.0);

        long hectaresMapped = Math.round(totalSqm / 10_000.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("users", users);
        stats.put("lands", totalLands);
        stats.put("verified", approved);
        stats.put("trees", trees);
        stats.put("hectares", hectaresMapped);

        return stats;
    }
}