package com.example.terraspoter.repository;

import com.example.terraspoter.model.Land;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LandRepository extends JpaRepository<Land, Long> {

    List<Land> findByStatus(String status);

    List<Land> findByCreatedBy(Long userId);

    long countByStatus(String status);

    @Query("SELECT SUM(l.areaSqm) FROM Land l WHERE l.status = :status")
    Double sumAreaSqmByStatus(@Param("status") String status);

    @Query("SELECT COUNT(l) FROM Land l")
    long countLand();


}