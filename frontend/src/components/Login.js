
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate(); 

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", form);

      
      localStorage.setItem("user", JSON.stringify(res.data));

      
      navigate("/dashboard"); 
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
           <div style={{ position: "relative", height: "100vh", width: "100vw", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* Background image with blur */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('/images/tree.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(8px)", 
        zIndex: 0,
      }}></div>

      {/* Login card */}
      <div style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        zIndex: 1, 
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(15px)",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0px 15px 40px rgba(0,0,0,0.15)",
          width: "350px",
          textAlign: "center",
        }}>
          <h2 style={{ marginBottom: "25px", color: "#2e7d32", fontWeight: "700" }}>Login</h2>
          <form onSubmit={handleSubmit}>
            {["email", "password"].map((field) => (
              <div key={field} style={{ position: "relative", margin: "20px 0" }}>
                <input
                  name={field}
                  type={field}
                  placeholder=" "
                  value={form[field]}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(0,0,0,0.2)",
                    outline: "none",
                    background: "rgba(255,255,255,0.4)",
                    color: "#333",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                  }}
                />
                <label
                  style={{
                    position: "absolute",
                    top: form[field] ? "-8px" : "50%",
                    left: "12px",
                    transform: form[field] ? "translateY(0)" : "translateY(-50%)",
                    color: "#2e7d32",
                    pointerEvents: "none",
                    transition: "0.3s",
                    fontSize: form[field] ? "12px" : "14px",
                    background: form[field] ? "rgba(255,255,255,0.4)" : "transparent",
                    padding: form[field] ? "0 4px" : "0",
                    borderRadius: "4px",
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              </div>
            ))}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#388e3c",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                marginTop: "10px",
                transition: "0.3s",
              }}
              onMouseEnter={e => e.target.style.backgroundColor = "#2e7d32"}
              onMouseLeave={e => e.target.style.backgroundColor = "#388e3c"}
            >
              Login
            </button>
          </form>
          <p style={{ marginTop: "15px", color: "#1b5e20" }}>
            Don’t have an account?{" "}
            <a href="/signup" style={{ color: "#388e3c", textDecoration: "none" }}>
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
