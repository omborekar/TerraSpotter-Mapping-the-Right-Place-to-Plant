/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navigation bar with responsive menu and user auth.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true });
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    setTimeout(fetchSession, 300);
    const refresh = () => fetchSession();
    window.addEventListener("login", refresh);
    window.addEventListener("logout", refresh);
    return () => {
      window.removeEventListener("login", refresh);
      window.removeEventListener("logout", refresh);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setDropdownOpen(false);
      window.dispatchEvent(new Event("logout"));
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');

        .nb-root {
          font-family: 'Inter', sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nb-bar {
          background: #f9f7f4;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: background 0.25s, box-shadow 0.25s;
        }
        .nb-bar.raised {
          background: rgba(249,247,244,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.06);
        }

        .nb-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 36px;
          height: 58px;
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* brand */
        .nb-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 19px;
          letter-spacing: -0.4px;
          color: #111;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          margin-right: 40px;
        }
        .nb-brand-mark {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #1c4a2e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        /* links */
        .nb-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }
        .nb-link {
          font-size: 13.5px;
          font-weight: 500;
          color: #555;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
          position: relative;
        }
        .nb-link:hover { color: #111; background: rgba(0,0,0,0.04); }
        .nb-link.active { color: #1c4a2e; font-weight: 600; }
        .nb-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 12px;
          right: 12px;
          height: 2px;
          border-radius: 2px 2px 0 0;
          background: #3a8c57;
        }

        /* right */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .nb-login {
          font-size: 13.5px;
          font-weight: 500;
          color: #444;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .nb-login:hover { background: rgba(0,0,0,0.05); color: #111; }

        .nb-signup {
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          padding: 8px 18px;
          border-radius: 6px;
          background: #1c4a2e;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.1px;
        }
        .nb-signup:hover { background: #254f33; }
        .nb-signup:active { transform: scale(0.98); }

        .nb-divider {
          width: 1px;
          height: 20px;
          background: rgba(0,0,0,0.1);
          margin: 0 4px;
        }

        /* profile pill */
        .nb-profile { position: relative; }
        .nb-profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 5px 5px 14px;
          border-radius: 30px;
          border: 1.5px solid rgba(0,0,0,0.1);
          background: white;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #222;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .nb-profile-btn:hover {
          border-color: rgba(0,0,0,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .nb-profile-btn.open {
          border-color: #3a8c57;
          box-shadow: 0 0 0 3px rgba(58,140,87,0.1);
        }
        .nb-initials {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1c4a2e;
          color: white;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .nb-chevron { transition: transform 0.2s; opacity: 0.4; }
        .nb-chevron.open { transform: rotate(180deg); }

        /* dropdown */
        .nb-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 230px;
          background: white;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          z-index: 999;
        }
        .nb-dd-user {
          padding: 16px 16px 12px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nb-dd-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1c4a2e 0%, #3a8c57 100%);
          color: white;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .nb-dd-info { overflow: hidden; }
        .nb-dd-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nb-dd-email {
          font-size: 11.5px;
          color: #999;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }
        .nb-dd-section { padding: 6px; }
        .nb-dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 13.5px;
          color: #333;
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          transition: background 0.12s, color 0.12s;
        }
        .nb-dd-item:hover { background: #f5f5f5; color: #111; }
        .nb-dd-item.logout { color: #c0392b; }
        .nb-dd-item.logout:hover { background: #fdf2f2; }
        .nb-dd-badge {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          background: #f5f5f5;
          flex-shrink: 0;
        }
        .nb-dd-item.logout .nb-dd-badge { background: #fdf2f2; }
        .nb-dd-sep { height: 1px; background: #f0f0f0; margin: 2px 6px; }

        @media (max-width: 768px) {
          .nb-links { display: none; }
          .nb-inner { padding: 0 16px; }
          .nb-brand { margin-right: 0; }
        }
      `}</style>

      <div className="nb-root">
        <div className={`nb-bar${scrolled ? " raised" : ""}`}>
          <div className="nb-inner">

            <Link to="/" className="nb-brand">
              <span className="nb-brand-mark">🌿</span>
              TerraSpotter
            </Link>

            <nav className="nb-links">
              <Link to="/" className={`nb-link${isActive("/") ? " active" : ""}`}>Home</Link>
              {user && (
                <>
                  <Link to="/Main" className={`nb-link${isActive("/Main") ? " active" : ""}`}>Submit Land</Link>
                  <Link to="/browse" className={`nb-link${isActive("/browse") ? " active" : ""}`}>Browse</Link>
                  <Link to="/PlantationShowcase " className={`nb-link${isActive("/PlantationShowcase ") ? " active" : ""}`}>History</Link>
                  <Link to="/about" className={`nb-link${isActive("/about") ? " active" : ""}`}>About</Link>
                  <Link to="/contact" className={`nb-link${isActive("/contact") ? " active" : ""}`}>Contact</Link>
                  {user.role === "ADMIN" && (
                    <Link to="/admin/pending" className={`nb-link${isActive("/admin/pending") ? " active" : ""}`}>Admin Panel</Link>
                  )}
                </>
              )}
            </nav>

            <div className="nb-right">
              {!user ? (
                <>
                  <Link to="/login" className="nb-login">Sign in</Link>
                  <div className="nb-divider" />
                  <Link to="/signup" className="nb-signup">Get started →</Link>
                </>
              ) : (
                <div className="nb-profile" ref={dropdownRef}>
                  <button
                    className={`nb-profile-btn${dropdownOpen ? " open" : ""}`}
                    onClick={() => setDropdownOpen(o => !o)}
                  >
                    {user.fname}
                    <div className="nb-initials">
                      {user.fname?.[0]?.toUpperCase()}{user.lname?.[0]?.toUpperCase()}
                    </div>
                    <svg className={`nb-chevron${dropdownOpen ? " open" : ""}`}
                      width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="#333" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div className="nb-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                      >
                        <div className="nb-dd-user">
                          <div className="nb-dd-avatar">
                            {user.fname?.[0]?.toUpperCase()}{user.lname?.[0]?.toUpperCase()}
                          </div>
                          <div className="nb-dd-info">
                            <div className="nb-dd-name">{user.fname} {user.lname}</div>
                            <div className="nb-dd-email">{user.email}</div>
                          </div>
                        </div>

                        <div className="nb-dd-section">
                          <Link to="/profile" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nb-dd-badge">👤</span> My Profile
                          </Link>
                          {user.role === "ADMIN" && (
                            <Link to="/admin/pending" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                              <span className="nb-dd-badge">⚙️</span> Admin Panel
                            </Link>
                          )}
                          <Link to="/Main" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nb-dd-badge">🌱</span> Submit Land
                          </Link>
                          <Link to="/browse" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nb-dd-badge">🗺️</span> Browse Lands
                          </Link>
                          <Link to="/PlantationShowcase" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nb-dd-badge">📚</span> Historya
                          </Link>
                          <Link to="/contact" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nb-dd-badge">📞</span> Contact
                          </Link>
                          <Link to="/about" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nb-dd-badge">ℹ️</span> About Us
                          </Link>
                          
                        </div>

                        <div className="nb-dd-sep" />

                        <div className="nb-dd-section">
                          <button className="nb-dd-item logout" onClick={handleLogout}>
                            <span className="nb-dd-badge">🚪</span> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}