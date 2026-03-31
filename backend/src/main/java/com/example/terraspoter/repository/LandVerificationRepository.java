package com.example.terraspoter.repository;

import com.example.terraspoter.model.LandVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LandVerificationRepository extends JpaRepository<LandVerification, Long> {

    boolean existsByLandIdAndUserId(Long landId, Long userId);

    long countByLandIdAndVote(Long landId, String vote);
}