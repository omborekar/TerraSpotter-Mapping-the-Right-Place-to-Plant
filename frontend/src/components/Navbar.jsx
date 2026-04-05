/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navigation bar — premium nature theme, fully responsive, no duplicates.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [user, setUser]                 = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true });
        setUser(res.data);
      } catch { setUser(null); }
    };
    setTimeout(fetchSession, 300);
    window.addEventListener("login",  fetchSession);
    window.addEventListener("logout", fetchSession);
    return () => {
      window.removeEventListener("login",  fetchSession);
      window.removeEventListener("logout", fetchSession);
    };
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setDropdownOpen(false);
      setMobileOpen(false);
      window.dispatchEvent(new Event("logout"));
      navigate("/login");
    } catch (err) { console.error("Logout failed", err); }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { to: "/",                   label: "Home"    },
        { to: "/Main",               label: "Submit"  },
        { to: "/browse",             label: "Browse"  },
        { to: "/plantationShowcase", label: "History" },
        { to: "/about",              label: "About"   },
        { to: "/contact",            label: "Contact" },
        ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: "Admin" }] : []),
      ]
    : [
        { to: "/",        label: "Home"    },
        { to: "/about",   label: "About"   },
        { to: "/contact", label: "Contact" },
      ];

  const dropdownItems = [
    { to: "/profile",            icon: "👤", label: "My Profile"   },
    { to: "/Main",               icon: "🌱", label: "Submit Land"  },
    { to: "/browse",             icon: "🗺️", label: "Browse Lands" },
    { to: "/plantationShowcase", icon: "📚", label: "History"      },
    { to: "/contact",            icon: "📞", label: "Contact"      },
    { to: "/about",              icon: "ℹ️",  label: "About Us"     },
    ...(user?.role === "ADMIN" ? [{ to: "/admin/pending", icon: "⚙️", label: "Admin Panel" }] : []),
  ];

  const initials = `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        .nb-root { font-family: 'DM Sans', sans-serif; position: sticky; top: 0; z-index: 100; }

        /* ── bar ── */
        .nb-bar {
          height: 64px;
          background: #f8f5f0;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: background 0.3s, box-shadow 0.3s;
        }
        .nb-bar.scrolled {
          background: rgba(248,245,240,0.93);
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 4px 28px rgba(0,0,0,0.09);
        }
        .nb-inner {
          height: 100%;
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* ── brand ── */
        .nb-brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0; margin-right: 40px;
          transition: opacity 0.15s;
        }
        .nb-brand:hover { opacity: 0.82; }
        .nb-brand img {
          width: 34px; height: 34px; border-radius: 10px; object-fit: cover;
          box-shadow: 0 2px 10px rgba(58,140,87,0.28); flex-shrink: 0;
        }
        .nb-brand span {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: #111; letter-spacing: -0.3px; white-space: nowrap;
        }

        /* ── desktop links ── */
        .nb-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nb-link {
          position: relative;
          font-size: 13.5px; font-weight: 500; color: #6b6457;
          text-decoration: none; padding: 7px 13px; border-radius: 8px;
          transition: color 0.15s, background 0.15s; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .nb-link:hover { color: #111; background: rgba(22,61,37,0.06); }
        .nb-link.on { color: #256638; font-weight: 600; background: rgba(58,140,87,0.09); }
        .nb-link.on::after {
          content: ''; position: absolute;
          bottom: 3px; left: 13px; right: 13px;
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #3a8c57, #256638);
        }

        /* ── right cluster ── */
        .nb-right { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }

        .nb-btn-ghost {
          font-size: 13.5px; font-weight: 500; color: #6b6457;
          text-decoration: none; padding: 8px 15px; border-radius: 8px;
          transition: color 0.15s, background 0.15s; letter-spacing: 0.01em; white-space: nowrap;
        }
        .nb-btn-ghost:hover { color: #111; background: rgba(0,0,0,0.05); }

        .nb-divider { width: 1px; height: 20px; background: rgba(0,0,0,0.09); flex-shrink: 0; }

        .nb-btn-cta {
          font-size: 13.5px; font-weight: 600; color: #fff;
          text-decoration: none; padding: 9px 20px; border-radius: 9px; white-space: nowrap;
          background: linear-gradient(145deg, #256638 0%, #163d25 100%);
          box-shadow: 0 2px 12px rgba(58,140,87,0.30), inset 0 1px 0 rgba(255,255,255,0.10);
          transition: filter 0.2s, box-shadow 0.2s, transform 0.12s; letter-spacing: 0.02em;
        }
        .nb-btn-cta:hover { filter: brightness(1.09); box-shadow: 0 4px 20px rgba(58,140,87,0.35); }
        .nb-btn-cta:active { transform: scale(0.97); }

        /* ── profile pill ── */
        .nb-pill {
          display: flex; align-items: center; gap: 9px;
          padding: 5px 6px 5px 16px; border-radius: 100px;
          border: 1.5px solid rgba(0,0,0,0.09); background: #fff;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; color: #111;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06); letter-spacing: 0.01em; white-space: nowrap;
        }
        .nb-pill:hover { border-color: rgba(22,61,37,0.25); box-shadow: 0 2px 14px rgba(0,0,0,0.09); background: #fefcfa; }
        .nb-pill.open { border-color: #3a8c57; box-shadow: 0 0 0 3px rgba(58,140,87,0.17); background: #fefcfa; }

        .nb-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(140deg, #163d25 0%, #3a8c57 100%);
          color: #fff; font-size: 10.5px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: 0.8px; flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(58,140,87,0.30);
        }
        .nb-chev { flex-shrink: 0; opacity: 0.35; transition: transform 0.22s cubic-bezier(.4,0,.2,1), opacity 0.15s; }
        .nb-chev.open { transform: rotate(180deg); opacity: 0.65; }

        /* ── dropdown ── */
        .nb-dd {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 252px; background: #fff;
          border: 1px solid rgba(0,0,0,0.07); border-radius: 18px;
          box-shadow: 0 12px 50px rgba(0,0,0,0.13), 0 3px 12px rgba(0,0,0,0.07);
          overflow: hidden; z-index: 999;
        }
        .nb-dd-bar { height: 3px; background: linear-gradient(90deg, #163d25, #3a8c57, #163d25); }
        .nb-dd-head {
          display: flex; align-items: center; gap: 11px;
          padding: 14px 16px 13px; border-bottom: 1px solid #f2ede7;
        }
        .nb-dd-avt {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(140deg, #163d25 0%, #3a8c57 100%);
          color: #fff; font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(58,140,87,0.20);
        }
        .nb-dd-name { font-size: 13.5px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.01em; }
        .nb-dd-email { font-size: 11.5px; color: #a89e93; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .nb-dd-body { padding: 6px; }
        .nb-dd-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 9px;
          font-size: 13.5px; font-weight: 400; color: #3a3530;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background 0.13s, color 0.13s; letter-spacing: 0.01em;
        }
        .nb-dd-row:hover { background: #f5f1ec; color: #111; }
        .nb-dd-row.red { color: #b03a2e; }
        .nb-dd-row.red:hover { background: #fdf3f2; }
        .nb-dd-ico {
          width: 30px; height: 30px; border-radius: 7px; background: #f5f1ec;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0; transition: background 0.13s;
        }
        .nb-dd-row:hover .nb-dd-ico { background: #ede8e2; }
        .nb-dd-row.red .nb-dd-ico { background: #fdf3f2; }
        .nb-dd-row.red:hover .nb-dd-ico { background: #fce8e6; }
        .nb-dd-sep { height: 1px; background: #f2ede7; margin: 3px 8px; }

        /* ── hamburger ── */
        .nb-burger {
          display: none; width: 40px; height: 40px; border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.09); background: #fff;
          cursor: pointer; align-items: center; justify-content: center;
          flex-direction: column; gap: 5px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: background 0.15s, border-color 0.15s; flex-shrink: 0;
        }
        .nb-burger:hover { background: #f5f1ec; border-color: rgba(22,61,37,0.2); }
        .nb-burger-ln {
          display: block; width: 18px; height: 1.5px; border-radius: 2px;
          background: #333; transition: transform 0.22s ease, opacity 0.2s;
        }
        .nb-burger.x .nb-burger-ln:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nb-burger.x .nb-burger-ln:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-burger.x .nb-burger-ln:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── mobile sheet ── */
        .nb-sheet {
          position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
          background: #faf9f7; z-index: 99; overflow-y: auto;
          border-top: 1px solid rgba(0,0,0,0.07);
        }
        .nb-sheet-inner { padding: 12px 16px 40px; }

        .nb-m-link {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 16px; border-radius: 12px;
          font-size: 15px; font-weight: 500; color: #3a3530;
          text-decoration: none; transition: background 0.14s, color 0.14s; margin-bottom: 2px;
        }
        .nb-m-link:hover { background: #f0ebe4; color: #111; }
        .nb-m-link.on { background: rgba(58,140,87,0.10); color: #256638; font-weight: 600; }
        .nb-m-dot { width: 6px; height: 6px; border-radius: 50%; background: #3a8c57; flex-shrink: 0; }

        .nb-m-sep { height: 1px; background: #e8e2da; margin: 10px 4px; }

        .nb-m-user {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; background: #fff;
          border: 1px solid #e8e2da; border-radius: 14px; margin-bottom: 10px;
        }
        .nb-m-avt {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(140deg, #163d25 0%, #3a8c57 100%);
          color: #fff; font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; letter-spacing: 0.6px; box-shadow: 0 2px 10px rgba(58,140,87,0.25);
        }
        .nb-m-name { font-size: 14px; font-weight: 600; color: #111; }
        .nb-m-email { font-size: 12px; color: #a89e93; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .nb-m-act {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 16px; border-radius: 12px;
          font-size: 15px; font-weight: 500; color: #3a3530;
          text-decoration: none; background: none; border: none;
          width: 100%; text-align: left; cursor: pointer;
          transition: background 0.14s, color 0.14s; margin-bottom: 2px;
        }
        .nb-m-act:hover { background: #f0ebe4; color: #111; }
        .nb-m-act.red { color: #b03a2e; }
        .nb-m-act.red:hover { background: #fdf3f2; }
        .nb-m-ico { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }

        .nb-m-signin {
          display: block; padding: 14px; border-radius: 12px;
          font-size: 15px; font-weight: 500; text-align: center; color: #6b6457;
          text-decoration: none; background: #fff; border: 1.5px solid #e8e2da;
          transition: background 0.14s, color 0.14s; margin-bottom: 8px;
        }
        .nb-m-signin:hover { background: #f5f1ec; color: #111; }
        .nb-m-cta {
          display: block; padding: 14px; border-radius: 12px;
          font-size: 15px; font-weight: 600; text-align: center; color: #fff;
          text-decoration: none; letter-spacing: 0.02em;
          background: linear-gradient(145deg, #256638 0%, #163d25 100%);
          box-shadow: 0 3px 14px rgba(58,140,87,0.30); transition: filter 0.15s;
        }
        .nb-m-cta:hover { filter: brightness(1.08); }

        @media (max-width: 900px) {
          .nb-links, .nb-btn-ghost, .nb-btn-cta, .nb-divider, .nb-pill { display: none !important; }
          .nb-burger { display: flex; }
          .nb-inner { padding: 0 18px; }
          .nb-brand { margin-right: 0; }
        }
      `}</style>

      <div className="nb-root">

        {/* ── BAR ── */}
        <div className={`nb-bar${scrolled ? " scrolled" : ""}`}>
          <div className="nb-inner">

            <Link to="/" className="nb-brand">
              <img src="/favicon.ico" alt="TerraSpotter" />
              <span>TerraSpotter</span>
            </Link>

            <nav className="nb-links">
              {navLinks.map(({ to, label }) => (
                <Link key={to + label} to={to} className={`nb-link${isActive(to) ? " on" : ""}`}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="nb-right">

              {!user ? (
                <>
                  <Link to="/login"  className="nb-btn-ghost">Sign in</Link>
                  <div className="nb-divider" />
                  <Link to="/signup" className="nb-btn-cta">Get started →</Link>
                </>
              ) : (
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <button
                    className={`nb-pill${dropdownOpen ? " open" : ""}`}
                    onClick={() => setDropdownOpen(o => !o)}
                  >
                    <span>{user.fname}</span>
                    <div className="nb-avatar">{initials}</div>
                    <svg className={`nb-chev${dropdownOpen ? " open" : ""}`}
                      width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="#333" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div className="nb-dd"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1,  y: 0,  scale: 1    }}
                        exit={{    opacity: 0,  y: -8, scale: 0.97 }}
                        transition={{ duration: 0.17, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="nb-dd-bar" />
                        <div className="nb-dd-head">
                          <div className="nb-dd-avt">{initials}</div>
                          <div style={{ overflow: "hidden" }}>
                            <div className="nb-dd-name">{user.fname} {user.lname}</div>
                            <div className="nb-dd-email">{user.email}</div>
                          </div>
                        </div>
                        <div className="nb-dd-body">
                          {dropdownItems.map(({ to, icon, label }) => (
                            <Link key={to} to={to} className="nb-dd-row"
                              onClick={() => setDropdownOpen(false)}>
                              <span className="nb-dd-ico">{icon}</span>
                              {label}
                            </Link>
                          ))}
                        </div>
                        <div className="nb-dd-sep" />
                        <div className="nb-dd-body">
                          <button className="nb-dd-row red" onClick={handleLogout}>
                            <span className="nb-dd-ico">🚪</span>
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                className={`nb-burger${mobileOpen ? " x" : ""}`}
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Toggle menu"
              >
                <span className="nb-burger-ln" />
                <span className="nb-burger-ln" />
                <span className="nb-burger-ln" />
              </button>

            </div>
          </div>
        </div>

        {/* ── MOBILE SHEET ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="nb-sheet"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1,  y: 0   }}
              exit={{    opacity: 0,  y: -16  }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="nb-sheet-inner">

                {navLinks.map(({ to, label }) => (
                  <Link key={to + label} to={to}
                    className={`nb-m-link${isActive(to) ? " on" : ""}`}>
                    {isActive(to) && <span className="nb-m-dot" />}
                    {label}
                  </Link>
                ))}

                <div className="nb-m-sep" />

                {!user ? (
                  <>
                    <Link to="/login"  className="nb-m-signin">Sign in</Link>
                    <Link to="/signup" className="nb-m-cta">Get started →</Link>
                  </>
                ) : (
                  <>
                    <div className="nb-m-user">
                      <div className="nb-m-avt">{initials}</div>
                      <div style={{ overflow: "hidden", flex: 1 }}>
                        <div className="nb-m-name">{user.fname} {user.lname}</div>
                        <div className="nb-m-email">{user.email}</div>
                      </div>
                    </div>

                    {dropdownItems.map(({ to, icon, label }) => (
                      <Link key={to} to={to} className="nb-m-act">
                        <span className="nb-m-ico">{icon}</span>
                        {label}
                      </Link>
                    ))}

                    <div className="nb-m-sep" />

                    <button className="nb-m-act red" onClick={handleLogout}>
                      <span className="nb-m-ico">🚪</span>
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}