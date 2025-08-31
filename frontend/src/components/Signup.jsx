console.log("Signup component loaded");

import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
console.log("jwt_decode module:", jwt_decode);


export default function Signup() {
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    phoneNo: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    console.log("Input changed:", e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fname.trim() || form.fname.length < 2) newErrors.fname = "First name must be at least 2 characters";
    if (!form.lname.trim() || form.lname.length < 2) newErrors.lname = "Last name must be at least 2 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) newErrors.email = "Invalid email format";

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phoneNo)) newErrors.phoneNo = "Phone number must be 10 digits";

    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(form.dob)) newErrors.dob = "Date of birth must be in YYYY-MM-DD format";

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password))
      newErrors.password = "Password must be at least 8 chars, include 1 uppercase letter and 1 number";

    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("Submitting signup form:", form);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/signup", {
        fname: form.fname,
        lname: form.lname,
        email: form.email,
        phoneNo: form.phoneNo,
        dob: form.dob,
        password: form.password,
      });

      console.log("Signup response:", response.data);
      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Signup error:", err);
      alert(err.response ? "Error: " + err.response.data : "Network error");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google credential received:", credentialResponse);

    try {
    const decoded = jwt_decode(credentialResponse.credential);
console.log("Decoded token:", decoded);

console.log("Decoded Google token:", decoded);

      const response = await axios.post("http://localhost:8080/api/auth/google-signup", {
        fname: decoded.given_name,
        lname: decoded.family_name,
        email: decoded.email,
      });

      console.log("Google signup response:", response.data);
      alert("Signup with Google successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Google signup error:", err);
      alert(err.response ? "Error: " + err.response.data : "Network error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>

        {/* First Name */}
        <div>
          <input
            name="fname"
            placeholder="First Name"
            value={form.fname}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
        </div>

        {/* Last Name */}
        <div>
          <input
            name="lname"
            placeholder="Last Name"
            value={form.lname}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.lname && <p className="text-red-500 text-sm mt-1">{errors.lname}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <input
            name="phoneNo"
            placeholder="Phone Number"
            value={form.phoneNo}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.phoneNo && <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>}
        </div>

        {/* DOB */}
        <div>
          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Sign Up
        </button>

        {/* Google Login */}
        <div className="flex justify-center mt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google login failed")}
          />
        </div>
      </form>
    </div>
  );
}
