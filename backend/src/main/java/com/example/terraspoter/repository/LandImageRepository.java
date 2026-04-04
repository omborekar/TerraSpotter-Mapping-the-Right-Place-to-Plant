/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for land images.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.LandImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandImageRepository extends JpaRepository<LandImage, Long> {

    // 📸 Get images of a land
    List<LandImage> findByLandId(Long landId);

}