package com.example.terraspoter.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // allow all endpoints
                        .allowedOrigins("http://localhost:5173") // your React frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // include OPTIONS for preflight
                        .allowedHeaders("*") // allow all headers
                        .allowCredentials(true) // allow cookies/session
                        .maxAge(3600); // cache preflight response for 1 hour
            }
        };
    }
}
