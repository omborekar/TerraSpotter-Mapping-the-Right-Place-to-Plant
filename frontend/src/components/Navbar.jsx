/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navigation bar — Tailwind CSS, responsive mobile menu, favicon logo, fixed duplicate links.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [user, setUser]               = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  /* ── session ── */
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
    window.addEventListener("login",  fetchSession);
    window.addEventListener("logout", fetchSession);
    return () => {
      window.removeEventListener("login",  fetchSession);
      window.removeEventListener("logout", fetchSession);
    };
  }, []);

  /* ── scroll ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── click-outside dropdown ── */
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* ── close mobile menu on route change ── */
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setDropdownOpen(false);
      setMobileOpen(false);
      window.dispatchEvent(new Event("logout"));
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const active = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { to: "/",                  label: "Home"      },
        { to: "/Main",              label: "Submit"    },
        { to: "/browse",            label: "Browse"    },
        { to: "/plantationShowcase",label: "History"   },
        { to: "/about",             label: "About"     },
        { to: "/contact",           label: "Contact"   },
        ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: "Admin" }] : []),
      ]
    : [
        { to: "/",       label: "Home"    },
        { to: "/about",  label: "About"   },
        { to: "/contact",label: "Contact" },
      ];

  const initials = `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="sticky top-0 z-50 font-['DM_Sans',sans-serif]">
      {/* Google font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* ── Bar ── */}
      <div
        className={`border-b border-black/[0.07] transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(248,245,240,0.90)] backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06),0_6px_30px_rgba(0,0,0,0.09)]"
            : "bg-[#f8f5f0]"
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-5 lg:px-10 h-[62px] flex items-center gap-2">

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline flex-shrink-0 mr-8 group"
          >
            <img
              src="/favicon.ico"
              alt="TerraSpotter"
              className="w-8 h-8 rounded-[9px] shadow-[0_2px_8px_rgba(58,140,87,0.28)] group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-['Playfair_Display',serif] font-bold text-[20px] text-[#111] tracking-tight group-hover:opacity-80 transition-opacity">
              TerraSpotter
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to + label}
                to={to}
                className={`relative text-[13.5px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 no-underline tracking-[0.01em] ${
                  active(to)
                    ? "text-[#256638] font-semibold bg-[rgba(58,140,87,0.08)]"
                    : "text-[#6b6457] hover:text-[#111] hover:bg-[rgba(22,61,37,0.06)]"
                }`}
              >
                {label}
                {active(to) && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-[#3a8c57] to-[#256638]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-2">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="text-[13.5px] font-medium text-[#6b6457] hover:text-[#111] hover:bg-black/5 px-4 py-2 rounded-lg transition-all no-underline tracking-[0.01em]"
                  >
                    Sign in
                  </Link>
                  <div className="w-px h-5 bg-black/[0.09]" />
                  <Link
                    to="/signup"
                    className="text-[13.5px] font-semibold text-white px-5 py-2 rounded-lg no-underline tracking-[0.02em] bg-gradient-to-br from-[#256638] to-[#163d25] shadow-[0_2px_10px_rgba(58,140,87,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] hover:brightness-110 hover:shadow-[0_4px_18px_rgba(58,140,87,0.28)] active:scale-[0.97] transition-all"
                  >
                    Get started →
                  </Link>
                </>
              ) : (
                /* Profile pill */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className={`flex items-center gap-2.5 pl-4 pr-2 py-1.5 rounded-full border-[1.5px] bg-white font-['DM_Sans',sans-serif] text-[13.5px] font-medium text-[#111] cursor-pointer transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.06)] tracking-[0.01em] ${
                      dropdownOpen
                        ? "border-[#3a8c57] shadow-[0_0_0_3px_rgba(58,140,87,0.18)] bg-[#fefcfa]"
                        : "border-black/[0.09] hover:border-[rgba(22,61,37,0.25)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-[#fefcfa]"
                    }`}
                  >
                    <span>{user.fname}</span>
                    <div className="w-[29px] h-[29px] rounded-full bg-gradient-to-br from-[#163d25] to-[#3a8c57] text-white text-[10.5px] font-bold flex items-center justify-center tracking-[0.8px] shadow-[0_1px_4px_rgba(58,140,87,0.28)] flex-shrink-0">
                      {initials}
                    </div>
                    <svg
                      className={`transition-transform duration-200 opacity-35 flex-shrink-0 ${dropdownOpen ? "rotate-180 opacity-60" : ""}`}
                      width="12" height="12" viewBox="0 0 12 12" fill="none"
                    >
                      <path d="M2 4l4 4 4-4" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        className="absolute top-[calc(100%+12px)] right-0 w-60 bg-white border border-black/[0.07] rounded-[18px] shadow-[0_12px_50px_rgba(0,0,0,0.14),0_3px_12px_rgba(0,0,0,0.08)] overflow-hidden z-[999]"
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* top accent */}
                        <div className="h-[3px] bg-gradient-to-r from-[#163d25] via-[#3a8c57] to-[#163d25]" />

                        {/* user info */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#f2ede7]">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#163d25] to-[#3a8c57] text-white text-[12.5px] font-bold flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(58,140,87,0.18)] tracking-[0.5px]">
                            {initials}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-[13.5px] font-semibold text-[#111] truncate tracking-[0.01em]">
                              {user.fname} {user.lname}
                            </div>
                            <div className="text-[11.5px] text-[#a89e93] truncate mt-0.5">{user.email}</div>
                          </div>
                        </div>

                        <div className="p-1.5 space-y-0.5">
                          {[
                            { to: "/profile",             icon: "👤", label: "My Profile"    },
                            { to: "/Main",                icon: "🌱", label: "Submit Land"   },
                            { to: "/browse",              icon: "🗺️", label: "Browse Lands"  },
                            { to: "/plantationShowcase",  icon: "📚", label: "History"       },
                            { to: "/contact",             icon: "📞", label: "Contact"       },
                            { to: "/about",               icon: "ℹ️", label: "About Us"      },
                            ...(user.role === "ADMIN"
                              ? [{ to: "/admin/pending", icon: "⚙️", label: "Admin Panel" }]
                              : []),
                          ].map(({ to, icon, label }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13.5px] text-[#3a3530] hover:bg-[#f5f1ec] hover:text-[#111] transition-all no-underline tracking-[0.01em] group"
                            >
                              <span className="w-[30px] h-[30px] rounded-[7px] bg-[#f5f1ec] group-hover:bg-[#ede8e2] flex items-center justify-center text-sm flex-shrink-0 transition-colors">
                                {icon}
                              </span>
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="h-px bg-[#f2ede7] mx-2" />

                        <div className="p-1.5">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13.5px] text-[#b03a2e] hover:bg-[#fdf3f2] w-full text-left transition-all tracking-[0.01em] group"
                          >
                            <span className="w-[30px] h-[30px] rounded-[7px] bg-[#fdf3f2] group-hover:bg-[#fce8e6] flex items-center justify-center text-sm flex-shrink-0 transition-colors">
                              🚪
                            </span>
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-black/[0.09] bg-white shadow-sm gap-[5px] transition-all hover:bg-[#f5f1ec]"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[1.5px] bg-[#333] rounded-full transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[#333] rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[#333] rounded-full transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden bg-[#faf9f7] border-b border-black/[0.07] shadow-[0_8px_30px_rgba(0,0,0,0.10)] overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-4 pt-3 pb-5 space-y-1">

              {/* Nav links */}
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to + label}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium no-underline transition-all ${
                    active(to)
                      ? "bg-[rgba(58,140,87,0.1)] text-[#256638] font-semibold"
                      : "text-[#3a3530] hover:bg-[#f0ebe4] hover:text-[#111]"
                  }`}
                >
                  {active(to) && <span className="w-1.5 h-1.5 rounded-full bg-[#3a8c57] flex-shrink-0" />}
                  {label}
                </Link>
              ))}

              <div className="h-px bg-[#e8e2da] my-3 mx-1" />

              {/* Auth section */}
              {!user ? (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    className="text-center text-[14px] font-medium text-[#6b6457] hover:text-[#111] px-4 py-3 rounded-xl hover:bg-[#f0ebe4] transition-all no-underline"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-center text-[14px] font-semibold text-white px-4 py-3 rounded-xl no-underline bg-gradient-to-br from-[#256638] to-[#163d25] shadow-[0_2px_10px_rgba(58,140,87,0.28)] hover:brightness-110 transition-all"
                  >
                    Get started →
                  </Link>
                </div>
              ) : (
                <div>
                  {/* user card */}
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white border border-[#e8e2da]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#163d25] to-[#3a8c57] text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0 tracking-wide">
                      {initials}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[13.5px] font-semibold text-[#111] truncate">{user.fname} {user.lname}</div>
                      <div className="text-[12px] text-[#a89e93] truncate">{user.email}</div>
                    </div>
                  </div>

                  {[
                    { to: "/profile",            icon: "👤", label: "My Profile"   },
                    { to: "/Main",               icon: "🌱", label: "Submit Land"  },
                    { to: "/browse",             icon: "🗺️", label: "Browse Lands" },
                    { to: "/plantationShowcase", icon: "📚", label: "History"      },
                    ...(user.role === "ADMIN"
                      ? [{ to: "/admin/pending", icon: "⚙️", label: "Admin Panel" }]
                      : []),
                  ].map(({ to, icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#3a3530] hover:bg-[#f0ebe4] hover:text-[#111] transition-all no-underline"
                    >
                      <span className="text-base">{icon}</span>
                      {label}
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#b03a2e] hover:bg-[#fdf3f2] w-full text-left transition-all mt-1"
                  >
                    <span className="text-base">🚪</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}