/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navbar — Verdant Editorial redesign. Cormorant Garant + Outfit fonts.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [ddOpen, setDdOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ddRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* session */
  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true });
        setUser(r.data);
      } catch { setUser(null); }
    };
    setTimeout(fetch, 300);
    window.addEventListener("login", fetch);
    window.addEventListener("logout", fetch);
    return () => {
      window.removeEventListener("login", fetch);
      window.removeEventListener("logout", fetch);
    };
  }, []);

  /* scroll */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* click-outside dropdown */
  useEffect(() => {
    const h = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* body lock when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  /* close dropdown on route change */
  useEffect(() => { setDdOpen(false); setDrawer(false); }, [pathname]);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null); setDdOpen(false); setDrawer(false);
      window.dispatchEvent(new Event("logout")); navigate("/login");
    } catch (e) { console.error(e); }
  };

  const on = (p) => pathname === p;
  const ini = `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase();

  const drawerGo = (to) => {
    setDrawer(false);
    if (pathname !== to) navigate(to);
  };

  const NAV = user ? [
    { to: "/", label: "Home", icon: "🏡" },
    { to: "/Main", label: "Submit", icon: "📍" },
    { to: "/browse", label: "Browse", icon: "🗺️" },
    { to: "/plantationShowcase", label: "Showcase", icon: "🏆" },
    { to: "/community", label: "Community", icon: "🌱" },
    { to: "/about", label: "About", icon: "ℹ️" },
    { to: "/contact", label: "Contact", icon: "📞" },
    ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: "Admin", icon: "⚙️" }] : []),
  ] : [
    { to: "/", label: "Home", icon: "🏡" },
    { to: "/about", label: "About", icon: "ℹ️" },
    { to: "/contact", label: "Contact", icon: "📞" },
  ];

  return (
    <>
      {/* ══ MAIN BAR ══════════════════════════════════════════════ */}
      <div className="font-['Outfit',sans-serif] sticky top-0 z-[200]">
        <div className={`h-[62px] flex items-center transition-all duration-300 ${scrolled
            ? "bg-[#0c1e11]/95 backdrop-blur-[18px] shadow-[0_1px_0_rgba(255,255,255,0.06),0_6px_32px_rgba(0,0,0,0.28)]"
            : "bg-[#0c1e11]"
          }`}>

          <div className="w-full max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center h-full gap-0">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 no-underline shrink-0 mr-10 lg:mr-0 group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-sm shadow-[0_0_16px_rgba(77,184,122,0.35)] shrink-0 group-hover:shadow-[0_0_22px_rgba(77,184,122,0.45)] transition-all">
                🌿
              </div>
              <span className="font-['Cormorant_Garant',serif] font-semibold text-[19px] text-white tracking-wide whitespace-nowrap">
                TerraSpotter
              </span>
            </Link>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-white/10 mx-8 shrink-0" />

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative text-[13px] font-medium no-underline py-1.5 px-3.5 rounded-lg transition-all duration-150 whitespace-nowrap ${on(to)
                      ? "text-[#4db87a] bg-[#4db87a]/10"
                      : "text-white/50 hover:text-white hover:bg-white/[0.07]"
                    }`}
                >
                  {label}
                  {on(to) && (
                    <span className="absolute bottom-[2px] left-3.5 right-3.5 h-[1.5px] rounded-full bg-[#4db87a]/60" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="ml-auto shrink-0 flex items-center gap-2">

              {/* Logged OUT — desktop */}
              {!user && (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-[13px] font-medium text-white/50 no-underline py-2 px-3.5 rounded-lg transition-all duration-150 hover:text-white hover:bg-white/[0.07]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-[13px] font-semibold text-[#0c1e11] no-underline py-2 px-4 rounded-lg bg-[#4db87a] hover:bg-[#5dcf8a] transition-all duration-200 shadow-[0_2px_12px_rgba(77,184,122,0.35)] active:scale-[0.97]"
                  >
                    Get started →
                  </Link>
                </div>
              )}

              {/* Logged IN — desktop dropdown */}
              {user && (
                <div className="hidden lg:block relative" ref={ddRef}>
                  <button
                    onClick={() => setDdOpen(o => !o)}
                    className={`flex items-center gap-2.5 h-9 pl-3 pr-2 rounded-xl border cursor-pointer transition-all duration-150 ${ddOpen
                        ? "border-[#4db87a]/40 bg-white/10"
                        : "border-white/10 bg-white/[0.06] hover:border-[#4db87a]/30 hover:bg-white/10"
                      }`}
                  >
                    <span className="text-[13px] font-medium text-white/70">{user.fname}</span>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] text-white text-[10px] font-bold flex items-center justify-center tracking-[0.8px] shrink-0">
                      {ini}
                    </div>
                    <svg
                      className={`opacity-30 shrink-0 transition-transform duration-200 ${ddOpen ? "rotate-180 opacity-60" : ""}`}
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                    >
                      <path d="M2 3.5l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {ddOpen && (
                      <motion.div
                        className="absolute top-[calc(100%+8px)] right-0 w-[240px] bg-[#0f2916] border border-white/[0.09] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] overflow-hidden z-[999]"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* Top accent */}
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#4db87a]/60 to-transparent" />

                        {/* User header */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                            {ini}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white truncate">{user.fname} {user.lname}</div>
                            <div className="text-[11px] text-white/35 truncate mt-[1px]">{user.email}</div>
                          </div>
                        </div>

                        {/* Nav items */}
                        <div className="p-1.5">
                          <Link
                            to="/profile"
                            onClick={() => setDdOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-white/60 no-underline hover:bg-white/[0.08] hover:text-white transition-all group"
                          >
                            <span className="w-7 h-7 rounded-lg bg-white/[0.07] flex items-center justify-center text-sm shrink-0 group-hover:bg-white/[0.12]">👤</span>
                            My Profile
                          </Link>
                          {NAV.filter(x => x.to !== "/").map(({ to, icon, label }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setDdOpen(false)}
                              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-white/60 no-underline hover:bg-white/[0.08] hover:text-white transition-all group"
                            >
                              <span className="w-7 h-7 rounded-lg bg-white/[0.07] flex items-center justify-center text-sm shrink-0 group-hover:bg-white/[0.12]">{icon}</span>
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="h-px bg-white/[0.07] mx-1.5" />

                        <div className="p-1.5">
                          <button
                            onClick={logout}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] text-red-400/80 bg-none border-none w-full text-left cursor-pointer hover:bg-red-500/10 hover:text-red-400 transition-all group"
                          >
                            <span className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-sm shrink-0 group-hover:bg-red-500/18">🚪</span>
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawer(o => !o)}
                aria-label="Menu"
                className="lg:hidden w-9 h-9 rounded-xl border border-white/12 bg-white/[0.07] flex flex-col items-center justify-center gap-[4.5px] cursor-pointer hover:bg-white/12 transition-colors shrink-0"
              >
                <span className={`w-4 h-[1.5px] bg-white rounded-full transition-all duration-200 ${drawer ? "translate-y-[6px] rotate-45" : ""}`} />
                <span className={`w-4 h-[1.5px] bg-white rounded-full transition-all duration-200 ${drawer ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`w-4 h-[1.5px] bg-white rounded-full transition-all duration-200 ${drawer ? "-translate-y-[6px] -rotate-45" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ══ MOBILE SIDE DRAWER ═══════════════════════════════════ */}
        <AnimatePresence>
          {drawer && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-[290] bg-black/55 backdrop-blur-[4px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setDrawer(false)}
              />

              {/* Panel */}
              <motion.div
                className="fixed top-0 right-0 bottom-0 w-[min(310px,84vw)] bg-[#0c1e11] z-[300] flex flex-col shadow-[-8px_0_60px_rgba(0,0,0,0.5)] overflow-hidden border-l border-white/[0.07]"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 h-[62px] shrink-0 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-sm shadow-[0_0_12px_rgba(77,184,122,0.3)]">
                      🌿
                    </div>
                    <span className="font-['Cormorant_Garant',serif] font-semibold text-[17px] text-white">
                      TerraSpotter
                    </span>
                  </div>
                  <button
                    onClick={() => setDrawer(false)}
                    className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.07] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/14 transition-colors cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* User card */}
                {user && (
                  <div className="mx-4 mt-4 p-3.5 bg-white/[0.05] border border-white/[0.08] rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                      {ini}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-white truncate">{user.fname} {user.lname}</div>
                      <span className="inline-flex items-center mt-1 py-0.5 px-2 rounded-full text-[9.5px] font-semibold tracking-[0.8px] uppercase bg-[#4db87a]/15 text-[#4db87a]">
                        {user.role === "ADMIN" ? "Admin" : "Member"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Scrollable nav */}
                <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
                  <div className="text-[9.5px] font-semibold uppercase tracking-[1.4px] text-white/25 px-2 pb-2 pt-1">
                    Navigation
                  </div>

                  {NAV.map(({ to, label, icon }) => (
                    <button
                      key={to}
                      onClick={() => drawerGo(to)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium w-full text-left cursor-pointer bg-none border-none transition-all duration-150 ${on(to)
                          ? "bg-[#4db87a]/12 text-[#4db87a]"
                          : "text-white/55 hover:text-white hover:bg-white/[0.07]"
                        }`}
                    >
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-[15px] shrink-0 border transition-all ${on(to)
                          ? "bg-[#4db87a]/15 border-[#4db87a]/25"
                          : "bg-white/[0.05] border-white/[0.08]"
                        }`}>
                        {icon}
                      </span>
                      <span className="flex-1">{label}</span>
                      {on(to) && <span className="w-1.5 h-1.5 rounded-full bg-[#4db87a] shrink-0" />}
                    </button>
                  ))}

                  {user && (
                    <>
                      <div className="h-px bg-white/[0.07] mx-1 my-2" />
                      <div className="text-[9.5px] font-semibold uppercase tracking-[1.4px] text-white/25 px-2 pb-2 pt-1">
                        Account
                      </div>

                      <button
                        onClick={() => drawerGo("/profile")}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/55 w-full text-left cursor-pointer bg-none border-none hover:text-white hover:bg-white/[0.07] transition-all"
                      >
                        <span className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[15px] shrink-0">👤</span>
                        My Profile
                      </button>

                      <div className="h-px bg-white/[0.07] mx-1 my-2" />

                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-red-400/70 w-full text-left cursor-pointer bg-none border-none hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <span className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center text-[15px] shrink-0">🚪</span>
                        Sign out
                      </button>
                    </>
                  )}

                  {!user && (
                    <>
                      <div className="h-px bg-white/[0.07] mx-1 my-3" />
                      <div className="flex flex-col gap-2 px-1 py-2">
                        <button
                          onClick={() => drawerGo("/login")}
                          className="w-full py-3 rounded-xl border border-white/12 bg-white/[0.07] text-[14px] font-medium text-white/65 cursor-pointer hover:text-white hover:bg-white/12 transition-all"
                        >
                          Sign in
                        </button>
                        <button
                          onClick={() => drawerGo("/signup")}
                          className="w-full py-3 rounded-xl bg-[#4db87a] text-[#0c1e11] text-[14px] font-semibold cursor-pointer hover:bg-[#5dcf8a] transition-all shadow-[0_4px_16px_rgba(77,184,122,0.3)]"
                        >
                          Get started →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}