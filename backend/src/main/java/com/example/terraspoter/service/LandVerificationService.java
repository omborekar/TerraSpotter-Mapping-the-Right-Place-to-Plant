package com.example.terraspoter.service;

import com.example.terraspoter.model.LandVerification;
import com.example.terraspoter.model.Land;
import com.example.terraspoter.repository.LandVerificationRepository;
import com.example.terraspoter.repository.LandRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LandVerificationService {

    @Autowired
    private LandVerificationRepository repo;

    @Autowired
    private LandRepository landRepository;

    public String verifyLand(Long landId, Long userId, String vote) {

        if (repo.existsByLandIdAndUserId(landId, userId)) {
            return "Already voted";
        }

        LandVerification v = new LandVerification();
        v.setLandId(landId);
        v.setUserId(userId);
        v.setVote(vote);

        repo.save(v);

        long approve = repo.countByLandIdAndVote(landId, "APPROVE");
        long reject  = repo.countByLandIdAndVote(landId, "REJECT");

        Land land = landRepository.findById(landId).orElseThrow();

        if (approve >= 3) {
            land.setStatus("APPROVED");
        } else if (reject >= 3) {
            land.setStatus("REJECTED");
        }

        landRepository.save(land);

        return "Vote submitted";
    }
}