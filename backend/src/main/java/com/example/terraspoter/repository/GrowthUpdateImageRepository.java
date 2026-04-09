/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for growth update image records.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.GrowthUpdateImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrowthUpdateImageRepository extends JpaRepository<GrowthUpdateImage, Long> {
}
