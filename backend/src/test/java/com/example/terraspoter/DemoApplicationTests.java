package com.example.terraspoter;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "CLOUDINARY_CLOUD_NAME=dummy",
    "CLOUDINARY_API_KEY=dummy",
    "CLOUDINARY_API_SECRET=dummy",
    "BREVO_API_KEY=dummy",
    "BREVO_SENDER_EMAIL=dummy@test.com",
    "BREVO_SENDER_NAME=dummy",
    "ML_API_URL=http://localhost:5000",
    "GEMINI_API_KEY=dummy"
})
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
