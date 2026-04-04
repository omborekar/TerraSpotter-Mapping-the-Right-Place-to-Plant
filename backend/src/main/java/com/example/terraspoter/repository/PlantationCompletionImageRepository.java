/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Repository for plantation completion images.
*/
package com.example.terraspoter.repository;

import com.example.terraspoter.model.PlantationCompletionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantationCompletionImageRepository
        extends JpaRepository<PlantationCompletionImage, Long> {
    // no custom queries needed
}