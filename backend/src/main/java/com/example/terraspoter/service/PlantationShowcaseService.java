/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Provides curated plantation showcase data.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.dto.PlantationShowcaseDTO;
import com.example.terraspoter.model.*;
import com.example.terraspoter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlantationShowcaseService {

    @Autowired private PlantationCompletionRepository completionRepo;
    @Autowired private PlantationCompletionImageRepository imageRepo;
    @Autowired private LandRepository landRepo;
    @Autowired private UserRepository userRepo;

    public List<PlantationShowcaseDTO> getCompletedPlantations() {

        return completionRepo.findAll().stream().map(c -> {

            PlantationShowcaseDTO dto = new PlantationShowcaseDTO();

            dto.setId(c.getId());
            dto.setTreesPlanted(c.getTreesPlanted());
            dto.setMoreCapacity(c.getMoreCapacity());
            dto.setNotes(c.getNotes());
            dto.setCompletedAt(c.getCreatedAt());

            // 🌍 LAND INFO
            landRepo.findById(c.getLandId()).ifPresent(land -> {
                dto.setTitle(land.getTitle());
                dto.setLocation(land.getNearbyLandmark());
            });

            // 👤 TEAM NAME
            userRepo.findById(c.getUserId()).ifPresent(user ->
                    dto.setTeamName(user.getFname() + " " + user.getLname())
            );

            // 📸 IMAGES (CLOUDINARY URLs)
            List<String> images = imageRepo.findAll().stream()
                    .filter(img -> img.getCompletionId().getId().equals(c.getId()))
                    .map(PlantationCompletionImage::getImageUrl)
                    .collect(Collectors.toList());

            dto.setImages(images);

            // ⭐ REVIEWS
            List<PlantationShowcaseDTO.ReviewDTO> reviews =
                    c.getReviews().stream().map(r -> {

                        PlantationShowcaseDTO.ReviewDTO rd = new PlantationShowcaseDTO.ReviewDTO();

                        rd.setId(r.getId());
                        rd.setUserName(r.getUserName());
                        rd.setRating(r.getRating());
                        rd.setComment(r.getComment());
                        rd.setCreatedAt(r.getCreatedAt());

                        rd.setImages(
                                r.getImages().stream()
                                        .map(PlantationReviewImage::getImageUrl)
                                        .collect(Collectors.toList())
                        );

                        return rd;

                    }).collect(Collectors.toList());

            dto.setReviews(reviews);

            return dto;

        }).collect(Collectors.toList());
    }
    public String addReview(Long completionId, Integer rating, String comment, Long userId) {

        PlantationCompletion completion = completionRepo.findById(completionId)
                .orElseThrow(() -> new RuntimeException("Completion not found"));

        PlantationReview review = new PlantationReview();
        review.setCompletionId(completionId);
        review.setUserId(userId);
        review.setRating(rating);
        review.setComment(comment);

        userRepo.findById(userId).ifPresent(user ->
                review.setUserName(user.getFname() + " " + user.getLname())
        );

        completion.getReviews().add(review);
        completionRepo.save(completion);

        return "Review added";
    }
}