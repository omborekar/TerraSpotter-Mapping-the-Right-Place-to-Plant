package com.example.terraspoter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@EnableWebSecurity
@SpringBootApplication
public class TerraSpoterApplication {
    public static void main(String[] args) {
        SpringApplication.run(TerraSpoterApplication.class, args);
    }
    @Bean
    public WebMvcConfigurer uploadResourceHandler() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                String uploadPath = System.getProperty("user.dir") + "/uploads/";
                System.out.println(">>> Serving uploads from: " + uploadPath);
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:" + uploadPath)
                        .setCachePeriod(3600);
            }
        };
    }
}
