/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Authentication and user management helper methods.
*/
package com.example.terraspoter.service;

import com.example.terraspoter.model.User;
import com.example.terraspoter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    // ===== FIND USER BY ID =====
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    // ===== SAVE USER (Signup) =====
    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // ===== FIND USER BY EMAIL =====
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ===== PASSWORD CHECK =====
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String generateRandomPassword() {
        // Cryptographically secure random password for Google OAuth sign-ups
        // (user never sees this; they log in via Google each time)
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(20);
        for (int i = 0; i < 20; i++) {
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        }
        return sb.toString();
    }
    public void updatePassword(User user, String newRawPassword) {
        user.setPassword(passwordEncoder.encode(newRawPassword));
        userRepository.save(user);
    }
}