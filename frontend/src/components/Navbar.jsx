import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch session info from backend and update on login/logout
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/auth/session", {
          withCredentials: true, // send cookies
        });
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };

    fetchSession();

    // Listen for custom login/logout events
    const handleLoginEvent = () => fetchSession();
    window.addEventListener("login", handleLoginEvent);
    window.addEventListener("logout", handleLoginEvent);

    return () => {
      window.removeEventListener("login", handleLoginEvent);
      window.removeEventListener("logout", handleLoginEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      window.dispatchEvent(new Event("logout")); // Notify Navbar to refresh
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const linkClasses = (path) =>
    `px-3 py-1 rounded hover:bg-green-700 transition ${
      location.pathname === path ? "bg-green-800" : ""
    }`;

  return (
    <nav className="bg-green-600 text-white px-6 py-3 flex justify-between items-center relative shadow-md">
      {/* Logo */}
      <h1 className="text-xl font-bold">TerraSpotter</h1>

      {/* Links */}
      <div className="flex items-center space-x-3">
        <Link to="/" className={linkClasses("/")}>
          Home
        </Link>
        <Link to="/about" className={linkClasses("/about")}>
          About
        </Link>
        <Link to="/contact" className={linkClasses("/contact")}>
          Contact
        </Link>

        {!user ? (
          <>
            <Link to="/login" className={linkClasses("/login")}>
              Login
            </Link>
            <Link to="/signup" className={linkClasses("/signup")}>
              Signup
            </Link>
          </>
        ) : (
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="flex items-center gap-2 bg-green-700 px-3 py-1 rounded hover:bg-green-800 transition">
              {user.fname ? `${user.fname} ${user.lname}` : "My Account"}{" "}
              <span className="text-sm">▼</span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-10 overflow-hidden"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-green-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-green-100"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
}
