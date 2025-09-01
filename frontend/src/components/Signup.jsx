import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { GiLeafSwirl, GiEarthAmerica, GiTreeBranch, GiPlantSeed, GiFlowerPot, GiButterfly, GiPalmTree } from "react-icons/gi";

export default function Signup() {
  const navigate = useNavigate();
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    if (!passwordRegex.test(form.password)) newErrors.password = "Password must be at least 8 chars, include 1 uppercase and 1 number";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/signup",
        {
          fname: form.fname,
          lname: form.lname,
          email: form.email,
          phoneNo: form.phoneNo,
          dob: form.dob,
          password: form.password,
        },
        { withCredentials: true }
      );

      localStorage.setItem("user", JSON.stringify(response.data));
      alert("Signup successful!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response ? "Error: " + err.response.data : "Network error");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/google",
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      localStorage.setItem("user", JSON.stringify(response.data));
      alert("Signup with Google successful!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response ? "Error: " + err.response.data : "Network error");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
      {/* Floating Elements */}
      <motion.div className="absolute top-10 left-10 text-green-600 opacity-30 text-6xl" animate={{ y: [0, -15, 0], rotate: [0, 15, -15, 0] }} transition={{ duration: 10, repeat: Infinity }}>
        <GiLeafSwirl />
      </motion.div>
      <motion.div className="absolute bottom-20 left-1/4 text-blue-400 opacity-30 text-7xl" animate={{ y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity }}>
        <GiEarthAmerica />
      </motion.div>
      <motion.div className="absolute top-1/3 right-16 text-green-700 opacity-30 text-5xl" animate={{ y: [0, -10, 0], rotate: [0, -10, 10, 0] }} transition={{ duration: 8, repeat: Infinity }}>
        <GiTreeBranch />
      </motion.div>
      <motion.div className="absolute bottom-10 right-1/3 text-yellow-600 opacity-40 text-4xl" animate={{ y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity }}>
        <GiPlantSeed />
      </motion.div>
      <motion.div className="absolute top-20 right-1/4 text-pink-500 opacity-30 text-6xl" animate={{ y: [0, 18, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 11, repeat: Infinity }}>
        <GiFlowerPot />
      </motion.div>
      <motion.div className="absolute bottom-1/4 left-12 text-purple-500 opacity-40 text-5xl" animate={{ y: [0, -14, 0], rotate: [0, -8, 8, 0] }} transition={{ duration: 10, repeat: Infinity }}>
        <GiButterfly />
      </motion.div>
      <motion.div className="absolute top-1/2 right-1/2 text-teal-600 opacity-20 text-8xl" animate={{ y: [0, 25, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 14, repeat: Infinity }}>
        <GiPalmTree />
      </motion.div>

      {/* Green Signup Card */}
      <Card className="w-full max-w-md bg-white/90 shadow-xl rounded-2xl z-10">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-4">Join TerraSpotter Family!</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <Input name="fname" placeholder="First Name" value={form.fname} onChange={handleChange} required className="border-green-300 focus:ring-green-500" />
              <Input name="lname" placeholder="Last Name" value={form.lname} onChange={handleChange} required className="border-green-300 focus:ring-green-500" />
            </div>
            {errors.fname && <p className="text-red-500 text-sm">{errors.fname}</p>}
            {errors.lname && <p className="text-red-500 text-sm">{errors.lname}</p>}

            <Input type="date" name="dob" value={form.dob} onChange={handleChange} required className="border-green-300 focus:ring-green-500" />
            {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}

            <Input type="tel" name="phoneNo" placeholder="Mobile Number" value={form.phoneNo} onChange={handleChange} required className="border-green-300 focus:ring-green-500" />
            {errors.phoneNo && <p className="text-red-500 text-sm">{errors.phoneNo}</p>}

            <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border-green-300 focus:ring-green-500" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <Input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border-green-300 focus:ring-green-500" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <Input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required className="border-green-300 focus:ring-green-500" />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md">Sign Up</Button>
          </form>

          <div className="my-4 text-center text-gray-500">or</div>

          <GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      // Send only the token string to backend
      const response = await axios.post(
        "http://localhost:8080/api/auth/google",
        credentialResponse.credential, // <-- just the string
        { withCredentials: true }
      );

      // Update session and localStorage after login
      const sessionRes = await axios.get("http://localhost:8080/api/auth/session", {
        withCredentials: true,
      });
      const userData = sessionRes.data;
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("login"));

      alert("Google signup/login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Google signup error:", err);
      alert(err.response ? "Error: " + err.response.data : "Network error");
    }
  }}
  onError={() => alert("Google login failed")}
/>

        </CardContent>
      </Card>
    </div>
  );
}
