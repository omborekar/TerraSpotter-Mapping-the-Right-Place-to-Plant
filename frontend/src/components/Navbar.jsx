import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/auth/session",
          { withCredentials: true }
        );
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };

    fetchSession();

    const refresh = () => fetchSession();
    window.addEventListener("login", refresh);
    window.addEventListener("logout", refresh);

    return () => {
      window.removeEventListener("login", refresh);
      window.removeEventListener("logout", refresh);
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
      window.dispatchEvent(new Event("logout"));
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const linkClasses = (path) =>
    `px-3 py-2 text-sm font-medium rounded-md transition
     ${
       location.pathname === path
         ? "text-green-700 bg-green-50"
         : "text-gray-700 hover:text-green-700 hover:bg-green-50"
     }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Brand */}
        <Link to="/" className="text-xl font-bold text-green-800">
          TerraSpotter
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Link to="/" className={linkClasses("/")}>Home</Link>
          <Link to="/about" className={linkClasses("/about")}>About</Link>
          <Link to="/contact" className={linkClasses("/contact")}>Contact</Link>

          {!user ? (
            <>
              <Link to="/login" className={linkClasses("/login")}>
                Login
              </Link>
              <Link
                to="/signup"
                className="ml-2 px-4 py-2 text-sm font-medium rounded-md bg-green-700 text-white hover:bg-green-800 transition"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div
              className="relative ml-3"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              {/* PROFILE BUTTON */}
              <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition">
                <FaUserCircle className="text-2xl text-green-700" />
                <span className="text-sm font-medium text-gray-700">
                  {user.fname}
                </span>
              </button>

              {/* DROPDOWN */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
