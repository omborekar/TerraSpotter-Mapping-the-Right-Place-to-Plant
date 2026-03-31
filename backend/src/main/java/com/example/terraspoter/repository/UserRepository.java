package com.example.terraspoter.repository;

import com.example.terraspoter.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT COUNT(DISTINCT(u.email)) FROM users u")
    long userCount();
}
