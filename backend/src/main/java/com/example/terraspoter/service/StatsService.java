package com.example.terraspoter.service;

import com.example.terraspoter.repository.LandRepository;
import com.example.terraspoter.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class StatsService {

    private final LandRepository landRepository;
    private final UserRepository userRepository;

    public StatsService(LandRepository landRepository,
                        UserRepository userRepository) {
        this.landRepository = landRepository;
        this.userRepository = userRepository;
    }

    /**
     * Returns live platform statistics for the login page hero panel.
     *
     * Keys returned:
     *   totalLands    — total number of submitted land parcels
     *   approvedLands — lands with status = "APPROVED"
     *   treesPlanted  — sum of treesPlanted field across all lands
     *   volunteers    — total registered users
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put("totalLands",    landRepository.count());
        stats.put("approvedLands", landRepository.countByStatus("APPROVED"));
        stats.put("treesPlanted",  landRepository.sumTreesPlanted());
        stats.put("volunteers",    userRepository.count());

        return stats;
    }
}