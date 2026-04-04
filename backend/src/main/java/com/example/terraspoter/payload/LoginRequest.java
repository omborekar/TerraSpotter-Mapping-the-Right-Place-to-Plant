/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: DTO for login request payload.
*/
package com.example.terraspoter.payload;


public class LoginRequest {
    private String email;
    private String password;

    // Getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
