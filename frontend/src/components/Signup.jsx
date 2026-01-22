import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (form.fname.trim().length < 2) newErrors.fname = "First name is too short";
    if (form.lname.trim().length < 2) newErrors.lname = "Last name is too short";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!/^\d{10}$/.test(form.phoneNo))
      newErrors.phoneNo = "Phone number must be 10 digits";
    if (!form.dob) newErrors.dob = "Date of birth is required";
    if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post(
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

      alert("Signup successful");
      navigate("/login");
    } catch (err) {
      alert(err.response ? err.response.data : "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* Left Page */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-green-800 to-green-900 text-white p-10">
          <div>
            <h2 className="text-3xl font-bold mb-4">Create your account</h2>
            <p className="text-green-100 leading-relaxed">
              TerraSpotter brings structure, transparency, and intelligence
              to community-driven afforestation initiatives.
            </p>
          </div>

          <div className="text-sm text-green-200">
            Join researchers, NGOs, students, and volunteers building
            verifiable green impact.
          </div>
        </div>

        {/* Right Page */}
        <div className="p-10 flex items-center">
          <Card className="w-full border-none shadow-none">
            <CardContent className="p-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Sign up
              </h1>
              <p className="text-gray-600 mb-6">
                Create your TerraSpotter account
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="fname"
                    placeholder="First name"
                    value={form.fname}
                    onChange={handleChange}
                  />
                  <Input
                    name="lname"
                    placeholder="Last name"
                    value={form.lname}
                    onChange={handleChange}
                  />
                </div>
                {(errors.fname || errors.lname) && (
                  <p className="text-sm text-red-600">
                    {errors.fname || errors.lname}
                  </p>
                )}

                <Input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                />
                {errors.dob && <p className="text-sm text-red-600">{errors.dob}</p>}

                <Input
                  name="phoneNo"
                  placeholder="Mobile number"
                  value={form.phoneNo}
                  onChange={handleChange}
                />
                {errors.phoneNo && <p className="text-sm text-red-600">{errors.phoneNo}</p>}

                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}

                <Button className="w-full bg-green-700 hover:bg-green-800">
                  Create account
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3 text-gray-400 text-sm">
                <div className="flex-1 h-px bg-gray-200" />
                or
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    await axios.post(
                      "http://localhost:8080/api/auth/google",
                      credentialResponse.credential,
                      { withCredentials: true }
                    );

                    window.dispatchEvent(new Event("login"));
                    navigate("/dashboard");
                  } catch {
                    alert("Google signup failed");
                  }
                }}
                onError={() => alert("Google login failed")}
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
