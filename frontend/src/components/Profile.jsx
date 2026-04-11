/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Profile page — Verdant Editorial redesign + Change Password via OTP.
*/
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import LoadingSpinner from "./ui/LoadingSpinner";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Chart tooltip ────────────────────────────────────────────
const ChartTip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c1e11] text-white text-[11.5px] rounded-xl px-3 py-2.5 shadow-xl font-['Outfit',sans-serif]">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{payload[0].value} {unit}</p>
    </div>
  );
};

// ─── Bone ─────────────────────────────────────────────────────
const Bone = ({ className = "" }) => (
  <div className={`rounded-xl bg-gradient-to-r from-[#f0ebe2] via-[#e8e2d8] to-[#f0ebe2] bg-[length:200%_100%] animate-pulse ${className}`} />
);

// ─── Stat card ────────────────────────────────────────────────
const StatCard = ({ label, value, accent, icon }) => (
  <div className="bg-white border border-[#ede8de] rounded-2xl p-5 flex flex-col gap-3 shadow-sm" style={{ borderTop: `3px solid ${accent}` }}>
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      <span className="font-['Cormorant_Garant',serif] text-[32px] font-semibold tracking-tight leading-none" style={{ color: accent }}>
        {value ?? "—"}
      </span>
    </div>
    <p className="text-[10px] font-semibold text-[#b5ac9e] uppercase tracking-[1.5px] font-['Outfit',sans-serif]">{label}</p>
  </div>
);

// ─── Password strength bar ────────────────────────────────────
function StrengthBar({ pw }) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.min(s, 4);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-[#4db87a]"];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-[#e0d8cf]"}`} />
        ))}
      </div>
      <p className="text-[11.5px] text-[#b5ac9e] font-['Outfit',sans-serif]">{labels[score]}</p>
    </div>
  );
}

// ─── Change Password Modal (OTP flow) ─────────────────────────
function ChangePasswordModal({ email, onClose }) {
  const [step, setStep] = useState("send");    // send | otp | reset | done
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [pws, setPws] = useState({ pw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ pw: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpStr = otp.join("");

  const handleSend = async () => {
    setError(""); setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/send-otp`, { email });
      setStep("otp");
    } catch (err) { setError(err.response?.data?.message || "Could not send OTP."); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (otpStr.length < 4) { setError("Enter the 4-digit code."); return; }
    setError(""); setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/verify-otp`, { email, otp: otpStr });
      setStep("reset");
    } catch (err) { setError(err.response?.data?.message || "Invalid or expired code."); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (pws.pw.length < 8) { setError("Minimum 8 characters."); return; }
    if (pws.pw !== pws.confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/reset`, { email, otp: otpStr, newPassword: pws.pw });
      setStep("done");
    } catch (err) { setError(err.response?.data?.message || "Reset failed. Try again."); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 3) document.getElementById(`cpw-otp-${idx + 1}`)?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) document.getElementById(`cpw-otp-${idx - 1}`)?.focus();
  };

  const inputCls = "w-full h-12 px-4 bg-white border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] outline-none placeholder:text-[#b5ac9e] font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all";

  const stepLabel = { send: "Verify Identity", otp: "Enter Code", reset: "New Password", done: "Done" }[step];
  const stepIdx = { send: 0, otp: 1, reset: 2, done: 3 }[step];

  return (
    <motion.div
      className="fixed inset-0 bg-[#0c1e11]/70 backdrop-blur-[7px] z-[9999] flex items-center justify-center p-5 font-['Outfit',sans-serif]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && step !== "done" && !loading && onClose()}
    >
      <motion.div
        className="bg-[#f7f4ee] w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl border border-[#ede8de]"
        initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        {/* Header */}
        <div className="relative bg-[#0c1e11] px-7 pt-7 pb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e11] to-[#0f2916]" />
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#4db87a]/10 blur-[70px]" />
          {step !== "done" && (
            <button onClick={onClose} disabled={loading}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/18 transition-all cursor-pointer flex items-center justify-center text-sm">✕</button>
          )}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-3">
              <span className="text-sm">🔐</span>
              <span className="text-[11px] font-semibold tracking-[2px] uppercase text-white/70">Change Password</span>
            </div>
            <h2 className="font-['Cormorant_Garant',serif] text-[22px] font-semibold text-white leading-tight">{stepLabel}</h2>
          </div>
          {/* Progress */}
          {step !== "done" && (
            <div className="relative z-10 flex gap-1.5 mt-4">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-[3px] rounded-full transition-all duration-500 ${i <= stepIdx ? "bg-[#4db87a]" : "bg-white/15"} ${i <= stepIdx ? "w-8" : "w-4"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-7 py-6 flex flex-col gap-4">

          <AnimatePresence mode="wait">

            {step === "send" && (
              <motion.div key="send" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <p className="text-[13.5px] text-[#7a6d5e] font-light leading-relaxed mb-5">
                  We'll send a 4-digit verification code to<br />
                  <span className="font-semibold text-[#4db87a]">{email}</span>
                </p>
                {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200/80 rounded-xl text-[12.5px] text-red-700">{error}</div>}
                <button onClick={handleSend} disabled={loading}
                  className="w-full h-12 rounded-xl bg-[#0c1e11] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#163d25] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</> : "Send OTP →"}
                </button>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <p className="text-[13px] text-[#7a6d5e] font-light mb-5">Enter the 4-digit code sent to <span className="font-medium text-[#4db87a]">{email}</span></p>
                {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200/80 rounded-xl text-[12.5px] text-red-700">{error}</div>}
                <div className="flex gap-2.5 justify-center mb-5">
                  {otp.map((digit, idx) => (
                    <input key={idx} id={`cpw-otp-${idx}`}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(e.target.value, idx)}
                      onKeyDown={e => handleOtpKey(e, idx)}
                      className="w-14 h-14 rounded-xl border-2 border-[#e0d8cf] bg-white text-center text-[26px] font-semibold text-[#0c1e11] font-['Cormorant_Garant',serif] outline-none focus:border-[#4db87a] focus:ring-4 focus:ring-[#4db87a]/10 transition-all caret-transparent hover:border-[#c8bfb4]"
                    />
                  ))}
                </div>
                <button onClick={handleVerify} disabled={loading}
                  className="w-full h-12 rounded-xl bg-[#0c1e11] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#163d25] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</> : "Verify Code →"}
                </button>
                <button onClick={() => { setOtp(["", "", "", ""]); setStep("send"); setError(""); }}
                  className="w-full text-center text-[12.5px] text-[#b5ac9e] hover:text-[#4db87a] transition-colors mt-3 cursor-pointer">
                  ← Resend code
                </button>
              </motion.div>
            )}

            {step === "reset" && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                className="flex flex-col gap-4">
                {error && <div className="px-4 py-3 bg-red-50 border border-red-200/80 rounded-xl text-[12.5px] text-red-700">{error}</div>}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">New Password</label>
                  <div className="relative">
                    <input type={showPw.pw ? "text" : "password"} value={pws.pw}
                      onChange={e => setPws({ ...pws, pw: e.target.value })}
                      placeholder="Min. 8 characters"
                      className={inputCls + " pr-12"}
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, pw: !s.pw }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5ac9e] hover:text-[#3d3128] text-sm cursor-pointer">
                      {showPw.pw ? "🙈" : "👁"}
                    </button>
                  </div>
                  <StrengthBar pw={pws.pw} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">Confirm Password</label>
                  <div className="relative">
                    <input type={showPw.confirm ? "text" : "password"} value={pws.confirm}
                      onChange={e => setPws({ ...pws, confirm: e.target.value })}
                      placeholder="Re-enter password"
                      className={inputCls + " pr-12"}
                    />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b5ac9e] hover:text-[#3d3128] text-sm cursor-pointer">
                      {showPw.confirm ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <button onClick={handleReset} disabled={loading}
                  className="w-full h-12 rounded-xl bg-[#0c1e11] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#163d25] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</> : "Update Password →"}
                </button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="text-center py-4">
                <motion.div
                  className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#2d6e3e] to-[#0c1e11] flex items-center justify-center text-3xl shadow-[0_8px_24px_rgba(12,30,17,0.2)]"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", bounce: 0.4 }}
                >
                  🔐
                </motion.div>
                <h3 className="font-['Cormorant_Garant',serif] text-[26px] font-semibold text-[#0c1e11] mb-2">Password updated!</h3>
                <p className="text-[13px] text-[#8a7d6e] font-light mb-6">Your password has been changed successfully.</p>
                <button onClick={onClose}
                  className="w-full h-12 rounded-xl bg-[#0c1e11] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#163d25] transition-all">
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Profile ─────────────────────────────────────────────
export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [lands, setLands] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [filter, setFilter] = useState("monthly");
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editData, setEditData] = useState({ fname: "", lname: "", phoneNo: "" });

  useEffect(() => {
    fetch(`${BASE_URL}/api/users/profile`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { setProfile(data); setEditData({ fname: data.fname || "", lname: data.lname || "", phoneNo: data.phoneNo || "" }); })
      .catch(() => { })
      .finally(() => setPageLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/lands/my`, { credentials: "include" })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setLands(data); }).catch(() => { });
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/plantations/completions/my`, { credentials: "include" })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setCompletions(data); }).catch(() => { });
  }, []);

  const stats = React.useMemo(() => {
    const map = {};
    [...lands.map(l => ({ ...l, type: "reported" })), ...completions.map(c => ({ ...c, type: "planted" }))].forEach(item => {
      if (!item.createdAt) return;
      const d = new Date(item.createdAt);
      const key = filter === "monthly"
        ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        : `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!map[key]) map[key] = {
        sortKey: filter === "monthly" ? d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate() : d.getFullYear() * 100 + d.getMonth(),
        label: filter === "monthly" ? `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}` : d.toLocaleString("default", { month: "short" }),
        reported: 0, planted: 0,
      };
      if (item.type === "reported") map[key].reported += 1;
      else map[key].planted += (item.treesPlanted || 0);
    });
    return Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
  }, [lands, completions, filter]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${BASE_URL}/api/users/profile`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(editData),
      });
      setProfile(p => ({ ...p, ...editData }));
      setEditOpen(false);
    } finally { setSaving(false); }
  };

  // Calendar
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const monthName = today.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const activityMap = {};
  lands.forEach(l => {
    if (!l.createdAt) return;
    const d = new Date(l.createdAt);
    if (d.getMonth() === month && d.getFullYear() === year) activityMap[d.getDate()] = (activityMap[d.getDate()] || 0) + 1;
  });

  const pendingLands = lands.filter(l => l.status === "PENDING").length;
  const approvedLands = lands.filter(l => l.status === "APPROVED").length;
  const totalTrees = completions.reduce((s, c) => s + (c.treesPlanted || 0), 0);

  if (pageLoading) return <LoadingSpinner text="Loading profile…" />;
  if (!profile) return (
    <div className="min-h-screen bg-[#f7f3ec] flex items-center justify-center text-red-500 text-sm font-['Outfit',sans-serif]">
      Failed to load profile. Please refresh.
    </div>
  );

  const initials = `${profile.fname?.[0] || ""}${profile.lname?.[0] || ""}`.toUpperCase();
  const calSwatches = ["#f7f3ec", "#d1fae5", "#a7f3d0", "#34d399", "#059669"];

  const inputCls = "w-full px-4 py-3 border-[1.5px] border-[#e0d8cf] rounded-xl text-sm text-[#0c1e11] bg-white outline-none font-['Outfit',sans-serif] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 hover:border-[#c8bfb4] transition-all";

  return (
    <div className="min-h-screen bg-[#f7f3ec] py-10 px-4 md:px-8 font-['Outfit',sans-serif]">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-[#0c1e11] rounded-3xl px-7 py-7 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1e11] via-[#0f2916] to-[#071408]" />
          <div className="absolute top-[-5%] right-[-5%] w-[380px] h-[380px] rounded-full bg-[#4db87a]/10 blur-[100px]" />

          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] flex items-center justify-center text-white font-['Cormorant_Garant',serif] text-2xl md:text-3xl font-semibold shrink-0 border-2 border-white/20 shadow-[0_0_20px_rgba(77,184,122,0.3)]">
              {initials}
            </div>
            <div>
              <h1 className="font-['Cormorant_Garant',serif] text-white text-[26px] md:text-[32px] font-semibold leading-tight tracking-[-0.3px]">
                {profile.fname} {profile.lname}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-white/45 text-[12.5px]">
                <span>✉ {profile.email}</span>
                {profile.phoneNo && <span>📞 {profile.phoneNo}</span>}
                {profile.dob && <span>🎂 {new Date(profile.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
              </div>
            </div>
          </div>

          <div className="relative flex gap-2 shrink-0 self-start md:self-auto flex-wrap">
            <button onClick={() => setEditOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/8 text-white text-[12.5px] font-medium hover:bg-white/15 hover:border-white/35 transition-all cursor-pointer">
              ✏ Edit Profile
            </button>
            <button onClick={() => setPwOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-[#4db87a]/30 bg-[#4db87a]/12 text-[#4db87a] text-[12.5px] font-medium hover:bg-[#4db87a]/20 transition-all cursor-pointer">
              🔐 Change Password
            </button>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard label="Lands Submitted" value={lands.length} accent="#0c1e11" icon="🌍" />
          <StatCard label="Pending Review" value={pendingLands} accent="#c9a84c" icon="⏳" />
          <StatCard label="Approved" value={approvedLands} accent="#4db87a" icon="✅" />
          <StatCard label="Trees Planted" value={totalTrees > 0 ? totalTrees.toLocaleString() : "—"} accent="#2563eb" icon="🌳" />
        </motion.div>

        {/* ── LANDS TABLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
          className="bg-white rounded-3xl border border-[#ede8de] shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[#ede8de]">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-base shrink-0">🌍</div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#0c1e11]">My Submitted Lands</h2>
              <p className="text-[12px] text-[#b5ac9e] mt-0.5 font-light">{lands.length} land{lands.length !== 1 ? "s" : ""} submitted</p>
            </div>
          </div>

          {lands.length === 0 ? (
            <div className="py-12 text-center text-[#b5ac9e] text-[13.5px] font-light">No lands submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#f0ebe2]">
                    {["Title", "Area (m²)", "Owner", "Water", "Status", "Submitted"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5ac9e] uppercase tracking-[1.2px] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lands.map((l, i) => (
                    <tr key={l.id} className={`border-b border-[#f7f3ec] hover:bg-[#f7f3ec]/60 transition-colors ${i === lands.length - 1 ? "border-0" : ""}`}>
                      <td className="px-4 py-3.5 font-semibold text-[#0c1e11] whitespace-nowrap">{l.title || "—"}</td>
                      <td className="px-4 py-3.5 text-[#6b5e4e]">{l.areaSqm ? Number(l.areaSqm).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3.5 text-[#6b5e4e] whitespace-nowrap">{l.ownerName || "—"}</td>
                      <td className="px-4 py-3.5 text-[#6b5e4e]">{l.waterAvailable || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold border ${l.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                            : l.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-200/80"
                              : "bg-amber-50 text-amber-700 border-amber-200/80"
                          }`}>
                          {l.status === "APPROVED" ? "✓" : l.status === "REJECTED" ? "✕" : "⏳"}
                          {l.status || "PENDING"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#b5ac9e] text-[11px] whitespace-nowrap">
                        {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ── ACTIVITY CHARTS ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
          className="bg-white rounded-3xl border border-[#ede8de] shadow-sm px-6 py-6"
        >
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#0c1e11]">Activity Stats</h2>
              <p className="text-[12px] text-[#b5ac9e] mt-0.5 font-light">Land submissions and trees planted over time</p>
            </div>
            <div className="flex gap-1 p-1 bg-[#f7f3ec] border border-[#ede8de] rounded-xl">
              {["monthly", "yearly"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all duration-150 cursor-pointer ${filter === f ? "bg-[#0c1e11] text-white shadow-sm" : "text-[#b5ac9e] hover:text-[#0c1e11]"
                    }`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {stats.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-[#b5ac9e] text-[13.5px] gap-2">
              <span className="text-3xl">📊</span>
              No stats yet — submit more lands to see trends.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "reported", label: "Lands Reported", color: "#0c1e11", unit: "lands", gradId: "g1" },
                { key: "planted", label: "Trees Planted", color: "#4db87a", unit: "trees", gradId: "g2" },
              ].map(c => (
                <div key={c.key}>
                  <p className="text-[10px] font-semibold text-[#b5ac9e] uppercase tracking-[1.5px] mb-3">{c.label}</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={stats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id={c.gradId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c.color} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f0ebe2" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#b5ac9e" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#b5ac9e" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTip unit={c.unit} />} />
                      <Area type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2} fill={`url(#${c.gradId})`}
                        dot={{ fill: c.color, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: c.color }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── ACTIVITY CALENDAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl border border-[#ede8de] shadow-sm px-6 py-6"
        >
          <div className="flex items-center gap-3 pb-5 border-b border-[#f0ebe2] mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-base shrink-0">📅</div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#0c1e11]">Activity Calendar</h2>
              <p className="text-[12px] text-[#b5ac9e] mt-0.5 font-light">Land submissions this month</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Cormorant_Garant',serif] text-[18px] font-semibold text-[#0c1e11]">{monthName} {year}</h3>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="text-center text-[9.5px] font-semibold text-[#b5ac9e] uppercase tracking-wide py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(startOffset).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const val = activityMap[day] || 0;
              const isToday = day === todayDate;
              return (
                <div key={day} title={`${val} submission${val !== 1 ? "s" : ""}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[11.5px] font-medium transition-transform hover:scale-110 cursor-default ${isToday ? "ring-2 ring-[#0c1e11] ring-offset-1 font-bold" : ""} ${val > 0 ? "text-emerald-900" : "text-[#b5ac9e]"}`}
                  style={{ background: calSwatches[Math.min(val, 4)] }}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-4 text-[11px] text-[#b5ac9e]">
            <span>Less</span>
            {calSwatches.map((c, i) => <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: c, border: "1px solid rgba(0,0,0,0.06)" }} />)}
            <span>More</span>
          </div>
        </motion.div>

      </div>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-6 font-['Outfit',sans-serif]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setEditOpen(false)}
          >
            <motion.div
              className="bg-[#f7f4ee] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-[#ede8de] flex flex-col gap-5"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.18 }}
            >
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-px bg-[#4db87a]" />
                <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#4db87a]">Profile</span>
              </div>
              <h2 className="font-['Cormorant_Garant',serif] text-[26px] font-semibold text-[#0c1e11] -mt-2">Edit Profile</h2>

              {[{ label: "First Name", key: "fname" }, { label: "Last Name", key: "lname" }, { label: "Phone Number", key: "phoneNo" }].map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[1px]">{label}</label>
                  <input
                    value={editData[key]}
                    onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}

              <div className="flex gap-3 justify-end pt-1">
                <button onClick={() => setEditOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#e0d8cf] text-[13px] font-medium text-[#8a7d6e] hover:border-[#c8bfb4] hover:text-[#0c1e11] transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#0c1e11] text-white text-[13px] font-semibold hover:bg-[#163d25] disabled:opacity-50 transition-all cursor-pointer">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <AnimatePresence>
        {pwOpen && (
          <ChangePasswordModal email={profile.email} onClose={() => setPwOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}