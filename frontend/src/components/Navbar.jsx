/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Navbar — fully dark, pure Tailwind, responsive with side drawer.
*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, X, Menu, ChevronDown, LogOut, User, Settings } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const { t } = useTranslation();
  const { user, xpData, logout: contextLogout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [ddOpen, setDdOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ddRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  useEffect(() => { setDdOpen(false); }, [pathname]);

  const logout = async () => {
    await contextLogout();
    setDdOpen(false);
    setDrawer(false);
    navigate("/login");
  };

  const on = (p) => pathname === p;
  const ini = `${user?.fname?.[0] ?? ""}${user?.lname?.[0] ?? ""}`.toUpperCase();

  const drawerGo = (to) => {
    setDrawer(false);
    if (pathname !== to) navigate(to);
  };

  const NAV = user ? [
    { to: "/", label: t("navbar.home", "Home"), icon: "🏡" },
    { to: "/Main", label: t("navbar.tracker", "Submit"), icon: "📍" },
    { to: "/browse", label: t("navbar.browse", "Browse"), icon: "🗺️" },
    { to: "/plantationShowcase", label: t("navbar.reports", "History"), icon: "📚" },
    { to: "/community", label: t("navbar.community", "Community"), icon: "🌱" },
    { to: "/leaderboard", label: t("navbar.leaderboard", "Leaderboard"), icon: "🏆" },
    { to: "/about", label: t("navbar.about", "About"), icon: "ℹ️" },
    { to: "/forum", label: t("navbar.forum", "Forum"), icon: "💬" },
    ...(user.role === "ADMIN" ? [{ to: "/admin/pending", label: t("navbar.admin", "Admin"), icon: "⚙️" }] : []),
  ] : [
    { to: "/", label: t("navbar.home", "Home"), icon: "🏡" },
    { to: "/leaderboard", label: t("navbar.leaderboard", "Leaderboard"), icon: "🏆" },
    { to: "/about", label: t("navbar.about", "About"), icon: "ℹ️" },
    { to: "/forum", label: t("navbar.forum", "Forum"), icon: "💬" },
  ];

  return (
    <>
      {/* ── TOP SHIMMER LINE ── */}
      <div className="h-[2.5px] bg-gradient-to-r from-emerald-900 via-primary to-emerald-900 animate-pulse sticky top-0 z-[201]" />

      {/* ── NAVBAR BAR ── */}
      <nav className={`sticky top-[2.5px] z-[200] transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-2xl border-b border-border shadow-lg shadow-black/20"
          : "bg-background border-b border-border"
      }`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-7 h-[62px] flex items-center gap-0">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-7 group">
            <img src="/favicon.ico" alt="TerraSpotter" className="w-8 h-8 rounded-[9px] object-cover ring-1 ring-primary/25 shadow-md shadow-primary/20 group-hover:ring-primary/50 group-hover:-rotate-6 transition-all duration-200" />
            <span className="font-bold text-[18.5px] tracking-tight bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent drop-shadow-sm">
              TerraSpotter
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative text-[13.5px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap ${
                  on(to)
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/8"
                }`}
              >
                {label}
                {on(to) && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary to-emerald-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="ml-auto flex items-center gap-2 shrink-0">

            {/* Language switcher — desktop only */}
            <div className="hidden lg:block">
              <LanguageSwitcher dark={theme === "dark"} />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-[10px] flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Auth — desktop */}
            {!user ? (
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-px h-4 bg-border" />
                <Link to="/login" className="text-[13.5px] font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all">
                  {t("navbar.login", "Sign in")}
                </Link>
                <Link to="/signup" className="text-[13.5px] font-bold text-primary-foreground px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/25 hover:shadow-primary/40">
                  {t("navbar.signup", "Get started →")}
                </Link>
              </div>
            ) : (
              /* Profile pill — desktop */
              <div className="hidden lg:block relative" ref={ddRef}>
                <button
                  onClick={() => setDdOpen(o => !o)}
                  className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-200 text-[13.5px] font-semibold whitespace-nowrap ${
                    ddOpen
                      ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:bg-card/80 shadow-sm"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-primary/20">
                    {ini}
                  </div>
                  <span className="text-foreground">{user.fname}</span>
                  {xpData && (
                    <span className="text-[10.5px] font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-800/40">
                      ⚡ {xpData.totalXp?.toLocaleString()} · Lv {xpData.level}
                    </span>
                  )}
                  <ChevronDown size={11} className={`text-muted-foreground transition-transform duration-200 ${ddOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {ddOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+10px)] right-0 w-[248px] bg-card border border-border rounded-2xl shadow-2xl shadow-black/30 overflow-hidden z-[999]"
                    >
                      {/* Shimmer top */}
                      <div className="h-[2px] bg-gradient-to-r from-emerald-900 via-primary to-emerald-900" />

                      {/* Who */}
                      <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-br from-secondary to-card border-b border-border">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 shadow-md">
                          {ini}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[13px] font-bold text-foreground truncate">{user.fname} {user.lname}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
                        </div>
                      </div>

                      {/* Nav items */}
                      <div className="p-1.5">
                        <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-primary/8 hover:text-primary transition-all" onClick={() => setDdOpen(false)}>
                          <span className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-[13px] shrink-0">👤</span>
                          {t("navbar.profile", "My Profile")}
                        </Link>
                        {NAV.filter(x => x.to !== "/").map(({ to, icon, label }) => (
                          <Link key={to} to={to} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-primary/8 hover:text-primary transition-all" onClick={() => setDdOpen(false)}>
                            <span className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-[13px] shrink-0">{icon}</span>
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-3" />

                      <div className="p-1.5">
                        <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-destructive hover:bg-destructive/10 w-full transition-all">
                          <span className="w-7 h-7 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-[13px] shrink-0">🚪</span>
                          {t("navbar.logout", "Sign out")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Hamburger — mobile */}
            <button
              onClick={() => setDrawer(o => !o)}
              aria-label="Menu"
              className="lg:hidden w-9 h-9 rounded-[9px] flex flex-col items-center justify-center gap-[4.5px] border border-border bg-card hover:border-primary/40 hover:bg-secondary transition-all"
            >
              <span className={`block w-[17px] h-[1.5px] bg-primary rounded-full transition-all duration-250 ${drawer ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`block w-[17px] h-[1.5px] bg-primary rounded-full transition-all duration-250 ${drawer ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-[17px] h-[1.5px] bg-primary rounded-full transition-all duration-250 ${drawer ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </button>

          </div>
        </div>
      </nav>

      {/* ── MOBILE SIDE DRAWER ── */}
      <AnimatePresence>
        {drawer && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[290] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawer(false)}
            />

            {/* Drawer panel */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[min(320px,82vw)] bg-background z-[300] flex flex-col shadow-2xl shadow-black/40 border-l border-border overflow-hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Drawer header */}
              <div className="h-[62px] flex items-center justify-between px-5 bg-gradient-to-r from-emerald-900 to-[#071408] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <img src="/favicon.ico" alt="" className="w-8 h-8 rounded-lg object-cover shadow-md" />
                  <span className="font-bold text-[16.5px] text-white tracking-tight">TerraSpotter</span>
                </div>
                <button onClick={() => setDrawer(false)} className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <X size={14} />
                </button>
              </div>

              {/* User card */}
              {user && (
                <div className="mx-3.5 mt-3.5 mb-1 p-3.5 bg-card border border-border rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0 shadow-md">
                    {ini}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-foreground">{user.fname} {user.lname}</div>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary/10 border border-primary/20 text-primary">
                      {user.role === "ADMIN" ? "Admin" : "Member"}
                      {xpData && ` · Lv ${xpData.level}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-2.5 pb-8 scrollbar-thin">

                {/* Language */}
                <p className="text-[9.5px] font-bold uppercase tracking-[1.3px] text-primary/60 px-2.5 pt-4 pb-1.5">{t("navbar.language", "Language")}</p>
                <div className="px-2.5 pb-4">
                  <LanguageSwitcher dark={false} />
                </div>

                {/* Theme toggle mobile */}
                <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:bg-primary/8 hover:text-primary transition-all mb-2 border border-transparent hover:border-primary/15">
                  <span className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-base shrink-0">
                    {theme === "light" ? "🌙" : "☀️"}
                  </span>
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </button>

                {/* Navigation */}
                <p className="text-[9.5px] font-bold uppercase tracking-[1.3px] text-primary/60 px-2.5 pt-2 pb-1.5">{t("navbar.navigation", "Navigation")}</p>

                {NAV.map(({ to, label, icon }) => (
                  <button
                    key={to}
                    onClick={() => drawerGo(to)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all mb-1 ${
                      on(to)
                        ? "bg-primary/12 text-primary font-semibold border border-primary/20"
                        : "text-muted-foreground hover:bg-primary/8 hover:text-primary border border-transparent hover:border-primary/15"
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base shrink-0 ${on(to) ? "bg-primary/20 border-primary/30" : "bg-secondary border-border"}`}>
                      {icon}
                    </span>
                    <span className="flex-1 text-left">{label}</span>
                    {on(to) && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </button>
                ))}

                {/* Account section */}
                {user ? (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-3 mx-1" />
                    <p className="text-[9.5px] font-bold uppercase tracking-[1.3px] text-primary/60 px-2.5 pb-1.5">{t("navbar.account", "Account")}</p>

                    <button onClick={() => drawerGo("/profile")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:bg-primary/8 hover:text-primary transition-all mb-1 border border-transparent hover:border-primary/15">
                      <span className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-base shrink-0">👤</span>
                      <span className="flex-1 text-left">{t("navbar.profile", "My Profile")}</span>
                      {xpData && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded-full border border-amber-800/30">
                          Lv {xpData.level}
                        </span>
                      )}
                    </button>

                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2 mx-1" />

                    <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20">
                      <span className="w-9 h-9 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-base shrink-0">🚪</span>
                      <span className="flex-1 text-left">{t("navbar.logout", "Sign out")}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-3 mx-1" />
                    <div className="flex flex-col gap-2 pt-1">
                      <Link to="/login" onClick={() => setDrawer(false)} className="block text-center px-4 py-3 rounded-xl text-[14px] font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all">
                        {t("navbar.login", "Sign in")}
                      </Link>
                      <Link to="/signup" onClick={() => setDrawer(false)} className="block text-center px-4 py-3 rounded-xl text-[14px] font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/30">
                        {t("navbar.signup", "Get started →")}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}