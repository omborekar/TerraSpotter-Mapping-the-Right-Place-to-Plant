package com.example.terraspoter.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // Disable CSRF for development
                .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll() // Allow signup/login endpoints
                .anyRequest().authenticated()
                .and()
                .httpBasic(); // optional for other endpoints
        return http.build();
    }
}

