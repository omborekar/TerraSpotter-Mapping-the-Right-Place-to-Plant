package com.example.terraspoter.payload;

public class SignupRequest {
    private String fname;
    private String lname;
    private String email;
    private String phoneNo;
    private String dob;      // Keep as String for payload, later convert to LocalDate in Entity
    private String password;
    private String otp;      // ← NEW: 4-digit email verification code

    // Getters and Setters

    public String getFname() { return fname; }
    public void setFname(String fname) { this.fname = fname; }

    public String getLname() { return lname; }
    public void setLname(String lname) { this.lname = lname; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // ← NEW
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}