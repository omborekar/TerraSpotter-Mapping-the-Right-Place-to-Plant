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

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

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
        return "12345678";
    }
}