import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { GiLeafSwirl, GiEarthAmerica, GiTreeBranch, GiPlantSeed, GiButterfly, GiPalmTree } from "react-icons/gi";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    // Login request with credentials (cookies for session)
    const res = await axios.post(
      "http://localhost:8080/api/auth/login",
      form,
      { withCredentials: true }
    );

    // Fetch session info after login
    const sessionRes = await axios.get("http://localhost:8080/api/auth/session", {
      withCredentials: true,
    });
    const userData = sessionRes.data;

    // Trigger Navbar or other listeners to update session info
    window.dispatchEvent(new Event("login"));

    // Store user info locally if needed
    localStorage.setItem("user", JSON.stringify(userData));

    // Navigate to dashboard
    navigate("/Main");
  } catch (err) {
    setErrors({ api: "Invalid credentials or session failed" });
  }
};


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
      {/* Floating Elements */}
      <motion.div className="absolute top-10 left-10 text-green-600 opacity-30 text-6xl"
        animate={{ y: [0, -15, 0], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity }}>
        <GiLeafSwirl />
      </motion.div>

      <motion.div className="absolute bottom-20 left-1/4 text-blue-400 opacity-30 text-7xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}>
        <GiEarthAmerica />
      </motion.div>

      <motion.div className="absolute top-1/3 right-16 text-green-700 opacity-30 text-5xl"
        animate={{ y: [0, -10, 0], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}>
        <GiTreeBranch />
      </motion.div>

      <motion.div className="absolute bottom-10 right-1/3 text-yellow-600 opacity-40 text-4xl"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity }}>
        <GiPlantSeed />
      </motion.div>

      <motion.div className="absolute top-1/4 left-1/2 text-purple-500 opacity-30 text-5xl"
        animate={{ y: [0, 15, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 11, repeat: Infinity }}>
        <GiButterfly />
      </motion.div>

      <motion.div className="absolute bottom-1/4 right-1/4 text-teal-600 opacity-20 text-8xl"
        animate={{ y: [0, 25, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 14, repeat: Infinity }}>
        <GiPalmTree />
      </motion.div>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-white/90 shadow-xl rounded-2xl z-10">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-4">
            Welcome Back!
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="border-green-300 focus:ring-green-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            {/* Password */}
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="border-green-300 focus:ring-green-500"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            {errors.api && <p className="text-red-500 text-sm">{errors.api}</p>}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md"
            >
              Login
            </Button>
          </form>

          <div className="my-4 text-center text-gray-500">or</div>

          <Button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <FcGoogle className="text-xl" /> Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
