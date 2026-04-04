/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Service handling land verification workflows and checks.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.model.Land;
import com.example.terraspoter.repository.LandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LandVerificationService {

    @Autowired
    private LandRepository landRepository;

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