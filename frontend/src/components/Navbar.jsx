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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --nb-bg: #f8f5f0;
          --nb-bg-glass: rgba(248, 245, 240, 0.88);
          --nb-border: rgba(30, 20, 10, 0.09);
          --nb-green-dark: #163d25;
          --nb-green-mid: #256638;
          --nb-green-light: #3a8c57;
          --nb-green-glow: rgba(58, 140, 87, 0.18);
          --nb-green-glow-strong: rgba(58, 140, 87, 0.28);
          --nb-text-primary: #111;
          --nb-text-secondary: #6b6457;
          --nb-text-muted: #a89e93;
          --nb-white: #ffffff;
          --nb-surface: #fff;
          --nb-surface-hover: #f5f1ec;
          --nb-red: #b03a2e;
          --nb-red-bg: #fdf3f2;
          --nb-shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
          --nb-shadow-md: 0 6px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
          --nb-shadow-lg: 0 12px 50px rgba(0,0,0,0.14), 0 3px 12px rgba(0,0,0,0.08);
          --nb-radius-sm: 8px;
          --nb-radius-md: 12px;
          --nb-radius-lg: 18px;
          --nb-radius-pill: 100px;
        }

        .nb-root {
          font-family: 'DM Sans', sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        /* ── Bar ── */
        .nb-bar {
          background: var(--nb-bg);
          border-bottom: 1px solid var(--nb-border);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .nb-bar.raised {
          background: var(--nb-bg-glass);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
          box-shadow: 0 1px 0 var(--nb-border), var(--nb-shadow-md);
        }

        /* ── Inner ── */
        .nb-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 40px;
          height: 62px;
          display: flex;
          align-items: center;
        }

        /* ── Brand ── */
        .nb-brand {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.3px;
          color: var(--nb-text-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
          margin-right: 44px;
          transition: opacity 0.15s;
        }
        .nb-brand:hover { opacity: 0.82; }

        .nb-brand-mark {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: linear-gradient(145deg, var(--nb-green-dark) 0%, var(--nb-green-mid) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 8px var(--nb-green-glow-strong), inset 0 1px 0 rgba(255,255,255,0.12);
          flex-shrink: 0;
        }

        /* ── Links ── */
        .nb-links {
          display: flex;
          align-items: center;
          gap: 1px;
          flex: 1;
        }

        .nb-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--nb-text-secondary);
          text-decoration: none;
          padding: 7px 13px;
          border-radius: var(--nb-radius-sm);
          transition: color 0.18s, background 0.18s;
          white-space: nowrap;
          position: relative;
          letter-spacing: 0.01em;
        }
        .nb-link:hover {
          color: var(--nb-text-primary);
          background: rgba(22, 61, 37, 0.06);
        }
        .nb-link.active {
          color: var(--nb-green-mid);
          font-weight: 600;
          background: rgba(58, 140, 87, 0.08);
        }
        .nb-link.active::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 13px;
          right: 13px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--nb-green-light), var(--nb-green-mid));
        }

        /* ── Right ── */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .nb-login {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--nb-text-secondary);
          text-decoration: none;
          padding: 8px 15px;
          border-radius: var(--nb-radius-sm);
          transition: background 0.15s, color 0.15s;
          letter-spacing: 0.01em;
        }
        .nb-login:hover {
          background: rgba(0,0,0,0.05);
          color: var(--nb-text-primary);
        }

        .nb-signup {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          padding: 9px 20px;
          border-radius: var(--nb-radius-sm);
          background: linear-gradient(145deg, var(--nb-green-mid) 0%, var(--nb-green-dark) 100%);
          transition: box-shadow 0.2s, transform 0.12s, filter 0.2s;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 10px var(--nb-green-glow-strong), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .nb-signup:hover {
          filter: brightness(1.08);
          box-shadow: 0 4px 18px var(--nb-green-glow-strong);
        }
        .nb-signup:active { transform: scale(0.97); }

        .nb-divider {
          width: 1px;
          height: 20px;
          background: var(--nb-border);
          margin: 0 2px;
        }

        /* ── Profile Pill ── */
        .nb-profile { position: relative; }

        .nb-profile-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 5px 8px 5px 15px;
          border-radius: var(--nb-radius-pill);
          border: 1.5px solid var(--nb-border);
          background: var(--nb-white);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--nb-text-primary);
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          letter-spacing: 0.01em;
          box-shadow: var(--nb-shadow-sm);
        }
        .nb-profile-btn:hover {
          border-color: rgba(22, 61, 37, 0.25);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          background: #fefcfa;
        }
        .nb-profile-btn.open {
          border-color: var(--nb-green-light);
          box-shadow: 0 0 0 3px var(--nb-green-glow);
          background: #fefcfa;
        }

        .nb-initials {
          width: 29px;
          height: 29px;
          border-radius: 50%;
          background: linear-gradient(140deg, var(--nb-green-dark) 0%, var(--nb-green-light) 100%);
          color: white;
          font-size: 10.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.8px;
          flex-shrink: 0;
          box-shadow: 0 1px 4px var(--nb-green-glow-strong);
        }

        .nb-chevron {
          transition: transform 0.22s cubic-bezier(.4,0,.2,1);
          opacity: 0.35;
          flex-shrink: 0;
        }
        .nb-chevron.open {
          transform: rotate(180deg);
          opacity: 0.6;
        }

        /* ── Dropdown ── */
        .nb-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 240px;
          background: var(--nb-white);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: var(--nb-radius-lg);
          box-shadow: var(--nb-shadow-lg);
          overflow: hidden;
          z-index: 999;
        }

        /* decorative top strip */
        .nb-dropdown::before {
          content: '';
          display: block;
          height: 3px;
          background: linear-gradient(90deg, var(--nb-green-dark), var(--nb-green-light), var(--nb-green-dark));
        }

        .nb-dd-user {
          padding: 14px 16px 12px;
          border-bottom: 1px solid #f2ede7;
          display: flex;
          align-items: center;
          gap: 11px;
        }
        .nb-dd-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(140deg, var(--nb-green-dark) 0%, var(--nb-green-light) 100%);
          color: white;
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px var(--nb-green-glow);
        }
        .nb-dd-info { overflow: hidden; }
        .nb-dd-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--nb-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.01em;
        }
        .nb-dd-email {
          font-size: 11.5px;
          color: var(--nb-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .nb-dd-section { padding: 6px; }

        .nb-dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: var(--nb-radius-sm);
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 400;
          color: #3a3530;
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background 0.14s, color 0.14s;
          letter-spacing: 0.01em;
        }
        .nb-dd-item:hover {
          background: var(--nb-surface-hover);
          color: var(--nb-text-primary);
        }
        .nb-dd-item.logout { color: var(--nb-red); }
        .nb-dd-item.logout:hover { background: var(--nb-red-bg); }

        .nb-dd-badge {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          background: #f5f1ec;
          flex-shrink: 0;
          transition: background 0.14s;
        }
        .nb-dd-item:hover .nb-dd-badge { background: #ede8e2; }
        .nb-dd-item.logout .nb-dd-badge { background: var(--nb-red-bg); }
        .nb-dd-item.logout:hover .nb-dd-badge { background: #fce8e6; }

        .nb-dd-sep {
          height: 1px;
          background: #f2ede7;
          margin: 2px 8px;
        }

        @media (max-width: 768px) {
          .nb-links { display: none; }
          .nb-inner { padding: 0 18px; }
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
              <Link to="/about" className={`nb-link${isActive("/about") ? " active" : ""}`}>About</Link>
              <Link to="/contact" className={`nb-link${isActive("/contact") ? " active" : ""}`}>Contact</Link>
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
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
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