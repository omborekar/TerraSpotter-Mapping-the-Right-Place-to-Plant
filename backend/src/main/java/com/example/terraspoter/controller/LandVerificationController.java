package com.example.terraspoter.controller;

import com.example.terraspoter.service.LandVerificationService;
import com.example.terraspoter.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lands")
public class LandVerificationController {

    @Autowired
    private LandVerificationService service;

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