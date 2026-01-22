import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
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
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post(
        "http://localhost:8080/api/auth/login",
        form,
        { withCredentials: true }
      );

      const sessionRes = await axios.get(
        "http://localhost:8080/api/auth/session",
        { withCredentials: true }
      );

      localStorage.setItem("user", JSON.stringify(sessionRes.data));
      window.dispatchEvent(new Event("login"));
      navigate("/Main");
    } catch {
      setErrors({ api: "Invalid email or password" });
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
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-green-700 to-green-900 text-white p-10">
          <div>
            <h2 className="text-3xl font-bold mb-4">TerraSpotter</h2>
            <p className="text-green-100 leading-relaxed">
              Turning unused land into verified, data-driven green ecosystems.
            </p>
          </div>

          <div className="text-sm text-green-200">
            Built for institutions, NGOs, and communities committed to
            sustainable afforestation.
          </div>
        </div>

        {/* Right Page */}
        <div className="p-10 flex items-center">
          <Card className="w-full border-none shadow-none">
            <CardContent className="p-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Sign in
              </h1>

              <p className="text-gray-600 mb-6">
                Access your TerraSpotter workspace
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {errors.api && (
                  <p className="text-sm text-red-600">
                    {errors.api}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  Sign in
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3 text-gray-400 text-sm">
                <div className="flex-1 h-px bg-gray-200" />
                or
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <FcGoogle className="text-xl" />
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
