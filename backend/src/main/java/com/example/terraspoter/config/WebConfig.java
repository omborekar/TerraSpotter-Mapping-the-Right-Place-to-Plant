package com.example.terraspoter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Serves files saved to the local "uploads/" directory under the URL
     * path /uploads/**.
     *
     * Without this, Spring has no idea that GET /uploads/abc.jpg should
     * resolve to the file at uploads/abc.jpg on disk — it just returns 404.
     *
     * "file:uploads/" is relative to the working directory (project root
     * when running with Maven/IDE, or the JAR location in production).
     * Switch to an absolute path or @Value("${upload.dir}") for production.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:uploads/");
    }
}