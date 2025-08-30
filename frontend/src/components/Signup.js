import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/signup", form, {
        // prevents automatic redirect handling in Axios
        maxRedirects: 0,
      });

      alert("Signup successful! Please login.");
      // optionally redirect manually
      window.location.href = "/login";
    } catch (err) {
      if (err.response) {
        alert("Error: " + err.response.data);
      } else {
        alert("Network or server error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
        required
      />
      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
