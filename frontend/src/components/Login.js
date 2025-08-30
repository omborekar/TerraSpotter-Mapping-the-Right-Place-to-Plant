// src/components/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // import navigate
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // initialize navigate

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", form);

      // Save user info in localStorage
      localStorage.setItem("user", JSON.stringify(res.data));

      // Redirect to dashboard
      navigate("/dashboard"); // <-- redirect after login
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
    </form>
  );
}
