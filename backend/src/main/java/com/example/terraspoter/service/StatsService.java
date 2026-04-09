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

        long usersCount = userRepository.count();
        long totalLands = landRepository.count();
        long verifiedLands = landRepository.countByStatus("APPROVED");
        Long treesPlanted = plantationCompletionRepository.totalTreesPlanted();
        
        Double totalAreaSqm = landRepository.sumTotalAreaSqm();
        long hectares = totalAreaSqm != null ? Math.round(totalAreaSqm / 10000.0) : 0;

        // Keys for Main.jsx and Contact.jsx
        stats.put("totalLands",    totalLands);
        stats.put("approvedLands", verifiedLands);
        stats.put("treesPlanted",  treesPlanted != null ? treesPlanted : 0);
        stats.put("volunteers",    usersCount);
        
        // Explicit keys expected by Contact.jsx
        stats.put("users",         usersCount);
        stats.put("hectares",      hectares);
        stats.put("trees",         treesPlanted != null ? treesPlanted : 0);
        stats.put("verified",      verifiedLands);

        return stats;
    }
}