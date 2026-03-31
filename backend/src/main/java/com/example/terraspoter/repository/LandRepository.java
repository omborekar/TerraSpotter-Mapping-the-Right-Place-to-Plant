package com.example.terraspoter.repository;

import com.example.terraspoter.model.Land;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandRepository extends JpaRepository<Land, Long> {

    // 🔍 Get all lands by user
    List<Land> findByCreatedBy(Long userId);
    long countByStatus(String status);

    @Query("SELECT SUM(l.areaSqm) FROM LandDetails l WHERE l.status = :status")
    Double sumAreaSqmByStatus(@Param("status") String status);


}