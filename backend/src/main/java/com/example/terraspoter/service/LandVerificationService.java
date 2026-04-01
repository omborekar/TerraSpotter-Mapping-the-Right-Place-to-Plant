package com.example.terraspoter.service;

import com.example.terraspoter.model.Land;
import com.example.terraspoter.repository.LandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LandVerificationService {

    @Autowired
    private LandRepository landRepository;

    /**
     * Single-vote approval system.
     * One APPROVE vote → status becomes APPROVED immediately.
     * One REJECT vote  → status becomes REJECTED immediately.
     * Either way the land is removed from the PENDING queue.
     */
    public String verifyLand(Long landId, Long userId, String vote) {

        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new RuntimeException("Land not found: " + landId));

        // Only act on PENDING lands
        if (!"PENDING".equalsIgnoreCase(land.getStatus())) {
            return "Land is already " + land.getStatus() + " — no action taken.";
        }

        switch (vote.toUpperCase()) {
            case "APPROVE":
                land.setStatus("APPROVED");
                landRepository.save(land);
                return "Land approved successfully.";

            case "REJECT":
                land.setStatus("REJECTED");
                landRepository.save(land);
                return "Land rejected successfully.";

            default:
                throw new IllegalArgumentException("Invalid vote value: " + vote + ". Use APPROVE or REJECT.");
        }
    }
}