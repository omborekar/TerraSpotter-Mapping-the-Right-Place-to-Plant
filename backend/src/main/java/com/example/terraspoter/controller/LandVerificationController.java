/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Endpoints for land verification APIs used by reviewers/admins.
*/
package com.example.terraspoter.controller;

import com.example.terraspoter.service.LandVerificationService;
import com.example.terraspoter.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/lands")
@RequiredArgsConstructor
public class LandVerificationController {

    private final LandVerificationService service;

    @PostMapping("/{id:\\d+}/verify")
    public ResponseEntity<?> verifyLand(
            @PathVariable Long id,
            @RequestParam String vote,
            @RequestParam Long userId   // simple for now
    ) {

        String res = service.verifyLand(id, userId, vote);
        return ResponseEntity.ok(res);
    }
}