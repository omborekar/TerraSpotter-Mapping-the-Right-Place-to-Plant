/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Signup component with OTP flow and password helpers.
*/
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL;

// password strength helper
function getStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8)           s++;
  if (/[A-Z]/.test(p))         s++;
  if (/[0-9]/.test(p))         s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

// 4-box OTP input component
function OtpInput({ value, onChange, disabled }) {
  const refs  = [useRef(), useRef(), useRef(), useRef()];
  const chars = (value + "    ").slice(0, 4).split("");

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = value.slice(0, i) + " " + value.slice(i + 1);
      onChange(next.trimEnd());
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = (value + "    ").slice(0, 4).split("");
    next[i] = e.key;
    onChange(next.join("").trimEnd());
    if (i < 3) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(text);
    refs[Math.min(text.length, 3)].current?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display:"flex", gap:10, justifyContent:"center", margin:"24px 0" }}>
      {[0,1,2,3].map(i => {
        const filled = chars[i] && chars[i] !== " ";
        return (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={filled ? chars[i] : ""}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            onChange={() => {}}
            disabled={disabled}
            autoFocus={i === 0}
            style={{
              width:56, height:64, textAlign:"center",
              fontSize:28, fontWeight:700,
              fontFamily:"'Fraunces', Georgia, serif",
              border:`2px solid ${filled ? "#2d8a55" : "#dde5e0"}`,
              borderRadius:12, outline:"none",
              background: filled ? "#f0fdf4" : "#ffffff",
              color:"#0d3320",
              boxShadow: filled ? "0 0 0 3px rgba(45,138,85,.12)" : "none",
              transition:"border-color .15s, box-shadow .15s, background .15s",
              opacity: disabled ? 0.6 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

// step progress bar component
function Steps({ step }) {
  const labels = ["Details", "Verify Email", "Done"];
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
      {labels.map((l, i) => {
        const active = i === step;
        const done   = i < step;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : 0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{
                width:30, height:30, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700,
                background: done ? "#2d8a55" : active ? "#0d3320" : "#dde5e0",
                color: done || active ? "white" : "#6b7a72",
                transition:"all .3s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize:10, fontWeight:600, letterSpacing:".6px",
                textTransform:"uppercase", whiteSpace:"nowrap",
                color: active ? "#0d3320" : "#6b7a72",
              }}>{l}</span>
            </div>
            {i < 2 && (
              <div style={{
                flex:1, height:2, margin:"0 6px", marginBottom:18,
                background: done ? "#2d8a55" : "#dde5e0",
                transition:"background .3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Signup main component
export default function Signup() {
  const navigate = useNavigate();

  // 0 = form details, 1 = OTP entry, 2 = success
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    fname:"", lname:"", email:"",
    phoneNo:"", dob:"", password:"", confirmPassword:"",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCp,  setShowCp]  = useState(false);

  // OTP state
  const [otp,        setOtp]        = useState("");
  const [otpError,   setOtpError]   = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendSecs, setResendSecs] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startResendTimer = () => {
    setResendSecs(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // age calculation
  const today = new Date();
  const dobD  = new Date(form.dob);
  let age = today.getFullYear() - dobD.getFullYear();
  const mm = today.getMonth() - dobD.getMonth();
  if (mm < 0 || (mm === 0 && today.getDate() < dobD.getDate())) age--;

  const validate = () => {
    const e = {};
    if (form.fname.trim().length < 2)
      e.fname = "At least 2 characters";
    if (form.lname.trim().length < 2)
      e.lname = "At least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";
    if (!/^\d{10}$/.test(form.phoneNo))
      e.phoneNo = "Must be exactly 10 digits";
    if (!form.dob)          e.dob = "Date of birth is required";
    else if (age < 14)      e.dob = "You must be at least 14 years old";
    if (form.password.length < 8)
      e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // STEP 0 → 1: send OTP
  const handleSendOtp = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/send-otp`, {
        email: form.email,
        fname: form.fname,   // used for greeting in OTP email
      });
      setStep(1);
      startResendTimer();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to send OTP. Try again.";
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  // STEP 1 → 2: verify OTP + complete signup
  const handleVerifyOtp = async () => {
    const clean = otp.replace(/\s/g, "");
    if (clean.length < 4) { setOtpError("Enter all 4 digits"); return; }
    setOtpError("");
    setOtpLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/signup`, {
        fname:    form.fname,
        lname:    form.lname,
        email:    form.email,
        phoneNo:  form.phoneNo,
        dob:      form.dob,
        password: form.password,
        otp:      clean,
      }, { withCredentials: true });
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Invalid or expired OTP.";
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // resend OTP
  const handleResend = async () => {
    if (resendSecs > 0) return;
    try {
      await axios.post(`${BASE_URL}/api/auth/send-otp`, {
        email: form.email,
        fname: form.fname,
      });
      setOtp("");
      setOtpError("");
      startResendTimer();
    } catch {
      setOtpError("Failed to resend. Please try again.");
    }
  };

  const strength      = getStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#e53e3e", "#d97706", "#2d8a55", "#0d3320"][strength];

  // render
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest:#0d3320; --canopy:#1a5c38; --leaf:#2d8a55; --sprout:#4db87a;
          --mist:#e8f5ee; --sand:#f5f1eb; --cream:#faf8f4;
          --ink:#0f1a14; --smoke:#6b7a72; --line:#dde5e0; --white:#ffffff;
          --danger:#c0392b;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); color:var(--ink); }

        .su-page { min-height:100vh; display:grid; grid-template-columns:400px 1fr; }

        /* left */
        .su-left {
          background:var(--forest); color:white; padding:52px 44px;
          display:flex; flex-direction:column;
          position:sticky; top:0; height:100vh; overflow:hidden;
        }
        .su-left::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse at 15% 85%, rgba(77,184,122,.18) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(13,51,32,.55) 0%, transparent 50%);
        }
        .su-left-inner { position:relative; z-index:1; display:flex; flex-direction:column; height:100%; }
        .su-logo { font-family:'Fraunces',serif; font-size:22px; font-weight:600; color:white; margin-bottom:52px; display:flex; align-items:center; gap:10px; }
        .su-logo-pip { width:9px; height:9px; border-radius:50%; background:var(--sprout); flex-shrink:0; }
        .su-left h1 { font-family:'Fraunces',serif; font-size:36px; font-weight:600; line-height:1.12; letter-spacing:-.4px; margin-bottom:16px; }
        .su-left h1 em { font-style:italic; color:var(--sprout); }
        .su-left-desc { font-size:14.5px; color:rgba(255,255,255,.6); line-height:1.75; margin-bottom:48px; }
        .su-perks { display:flex; flex-direction:column; gap:16px; margin-bottom:auto; }
        .su-perk { display:flex; align-items:flex-start; gap:12px; }
        .su-perk-dot { width:7px; height:7px; border-radius:50%; background:var(--sprout); flex-shrink:0; margin-top:6px; }
        .su-perk-text h4 { font-size:13.5px; font-weight:600; color:white; margin-bottom:2px; }
        .su-perk-text p  { font-size:12.5px; color:rgba(255,255,255,.5); line-height:1.55; }
        .su-left-foot { margin-top:40px; padding-top:24px; border-top:1px solid rgba(255,255,255,.1); font-size:12.5px; color:rgba(255,255,255,.3); line-height:1.6; }

        /* right */
        .su-right { background:var(--cream); padding:52px 60px 80px; display:flex; align-items:flex-start; justify-content:center; overflow-y:auto; }
        .su-form-wrap { width:100%; max-width:440px; }

        .su-form-title { font-family:'Fraunces',serif; font-size:32px; font-weight:600; letter-spacing:-.3px; color:var(--forest); margin-bottom:6px; }
        .su-form-sub   { font-size:14px; color:var(--smoke); margin-bottom:28px; }

        /* fields */
        .su-field { display:flex; flex-direction:column; gap:5px; margin-bottom:16px; }
        .su-label { font-size:12px; font-weight:600; color:#4a5e52; text-transform:uppercase; letter-spacing:.7px; }
        .su-err   { font-size:12px; color:var(--danger); margin-top:2px; }
        .su-input-wrap { position:relative; display:flex; align-items:center; }
        .su-input {
          width:100%; padding:11px 14px; border:1.5px solid var(--line); border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:14px; color:var(--ink);
          background:var(--white); outline:none; transition:border-color .2s,box-shadow .2s;
        }
        .su-input:focus { border-color:var(--leaf); box-shadow:0 0 0 3px rgba(45,138,85,.1); }
        .su-input.e  { border-color:var(--danger); background:#fff8f8; }
        .su-input.pw { padding-right:44px; }
        .su-pw-eye { position:absolute; right:12px; background:none; border:none; cursor:pointer; font-size:16px; color:var(--smoke); padding:0; }
        .su-pw-eye:hover { color:var(--forest); }
        .su-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

        /* strength */
        .su-strength { margin-top:6px; display:flex; flex-direction:column; gap:5px; }
        .su-strength-bar { height:3px; border-radius:2px; background:var(--line); overflow:hidden; }
        .su-strength-fill { height:100%; border-radius:2px; transition:width .3s,background .3s; }

        /* api error */
        .su-api-err { padding:11px 14px; background:#fdf2f2; border:1px solid #fecaca; border-radius:8px; font-size:13px; color:var(--danger); margin-bottom:16px; }

        /* submit */
        .su-submit {
          width:100%; padding:13px; background:var(--forest); color:white;
          border:none; border-radius:8px; font-family:'DM Sans',sans-serif;
          font-size:15px; font-weight:600; cursor:pointer;
          transition:background .15s; display:flex; align-items:center; justify-content:center; gap:8px;
          margin-top:4px;
        }
        .su-submit:hover:not(:disabled) { background:var(--canopy); }
        .su-submit:disabled { opacity:.65; cursor:not-allowed; }
        .su-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .65s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .su-section-head { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:var(--smoke); margin:20px 0 14px; display:flex; align-items:center; gap:10px; }
        .su-section-head::after { content:''; flex:1; height:1px; background:var(--line); }

        .su-divider { display:flex; align-items:center; gap:12px; margin:22px 0; font-size:12.5px; color:var(--smoke); }
        .su-divider::before, .su-divider::after { content:''; flex:1; height:1px; background:var(--line); }

        .su-signin { text-align:center; font-size:13.5px; color:var(--smoke); margin-top:22px; }
        .su-signin a { color:var(--leaf); font-weight:600; text-decoration:none; }
        .su-signin a:hover { color:var(--forest); }

        /* OTP step */
        .otp-card { background:white; border-radius:16px; border:1px solid var(--line); padding:32px; box-shadow:0 2px 20px rgba(13,51,32,.08); text-align:center; }
        .otp-email-chip { display:inline-flex; align-items:center; gap:7px; padding:7px 16px; background:var(--mist); border-radius:100px; font-size:13px; font-weight:600; color:var(--canopy); margin:10px 0 6px; }
        .otp-hint { font-size:13px; color:var(--smoke); line-height:1.6; margin-top:6px; }
        .otp-err  { padding:9px 14px; background:#fdf2f2; border:1px solid #fecaca; border-radius:8px; font-size:13px; color:var(--danger); margin-bottom:12px; }
        .otp-resend { font-size:13px; color:var(--smoke); margin-top:14px; }
        .otp-resend button { background:none; border:none; color:var(--leaf); font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; padding:0; }
        .otp-resend button:disabled { color:var(--smoke); cursor:default; }
        .otp-back { background:none; border:none; color:var(--smoke); font-size:13px; cursor:pointer; font-family:'DM Sans',sans-serif; margin-top:12px; text-decoration:underline; }

        /* success */
        .success-card { background:white; border-radius:20px; border:1px solid var(--line); padding:48px 36px; box-shadow:0 2px 20px rgba(13,51,32,.08); text-align:center; }
        .success-icon { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,var(--leaf),var(--canopy)); display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 24px; box-shadow:0 8px 24px rgba(45,138,85,.25); }
        .success-title { font-family:'Fraunces',serif; font-size:26px; font-weight:600; color:var(--forest); margin-bottom:10px; }
        .success-sub { font-size:14px; color:var(--smoke); line-height:1.75; margin-bottom:28px; }
        .success-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 28px; background:var(--forest); color:white; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; text-decoration:none; transition:background .15s; }
        .success-btn:hover { background:var(--canopy); }

        @media(max-width:860px){
          .su-page { grid-template-columns:1fr; }
          .su-left { display:none; }
          .su-right { padding:32px 20px 60px; }
        }
      `}</style>

      <div className="su-page">

        {/* Left panel */}
        <motion.aside className="su-left"
          initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:.55 }}>
          <div className="su-left-inner">
            <div className="su-logo"><span className="su-logo-pip" />TerraSpotter</div>
            <h1>Join the<br /><em>green network</em></h1>
            <p className="su-left-desc">
              TerraSpotter brings structure, transparency, and intelligence
              to community-driven afforestation across India.
            </p>
            <div className="su-perks">
              {[
                ["Submit & track land parcels",        "Map boundaries, upload photos, and get matched with planting teams automatically."],
                ["AI-powered species recommendations", "Soil type, rainfall, and climate data generate native tree recommendations for every parcel."],
                ["Verified impact tracking",           "CO₂ capture, canopy growth, and water recharge data updated as plantations mature."],
                ["Open to all — free forever",         "Built for NGOs, researchers, students, local bodies, and individual volunteers."],
              ].map(([h, p]) => (
                <div key={h} className="su-perk">
                  <div className="su-perk-dot" />
                  <div className="su-perk-text"><h4>{h}</h4><p>{p}</p></div>
                </div>
              ))}
            </div>
            <p className="su-left-foot">Your data is used only to connect land with planting teams.<br />No ads. No selling. No noise.</p>
          </div>
        </motion.aside>

        {/* RIGHT PANEL */}
        <motion.div className="su-right"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45, delay:.08 }}>
          <div className="su-form-wrap">

            <Steps step={step} />

            <AnimatePresence mode="wait">

              {/* STEP 0: registration form */}
              {step === 0 && (
                <motion.div key="form"
                  initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:24 }} transition={{ duration:.28 }}>

                  <h1 className="su-form-title">Create account</h1>
                  <p className="su-form-sub">Free forever — takes 60 seconds</p>

                  {errors.api && <div className="su-api-err">⚠ {errors.api}</div>}

                  <form onSubmit={handleSendOtp} noValidate>
                    <div className="su-section-head">Personal</div>
                    <div className="su-grid-2">
                      <div className="su-field">
                        <label className="su-label">First Name</label>
                        <input className={`su-input${errors.fname?" e":""}`}
                          name="fname" placeholder="Arjun"
                          value={form.fname} onChange={handleChange} autoComplete="given-name" />
                        {errors.fname && <span className="su-err">{errors.fname}</span>}
                      </div>
                      <div className="su-field">
                        <label className="su-label">Last Name</label>
                        <input className={`su-input${errors.lname?" e":""}`}
                          name="lname" placeholder="Desai"
                          value={form.lname} onChange={handleChange} autoComplete="family-name" />
                        {errors.lname && <span className="su-err">{errors.lname}</span>}
                      </div>
                    </div>
                    <div className="su-grid-2">
                      <div className="su-field">
                        <label className="su-label">Date of Birth</label>
                        <input className={`su-input${errors.dob?" e":""}`}
                          type="date" name="dob"
                          value={form.dob} onChange={handleChange} />
                        {errors.dob && <span className="su-err">{errors.dob}</span>}
                      </div>
                      <div className="su-field">
                        <label className="su-label">Mobile Number</label>
                        <input className={`su-input${errors.phoneNo?" e":""}`}
                          name="phoneNo" placeholder="9876543210" maxLength={10}
                          value={form.phoneNo} onChange={handleChange} autoComplete="tel" />
                        {errors.phoneNo && <span className="su-err">{errors.phoneNo}</span>}
                      </div>
                    </div>

                    <div className="su-section-head">Account</div>
                    <div className="su-field">
                      <label className="su-label">Email Address</label>
                      <input className={`su-input${errors.email?" e":""}`}
                        type="email" name="email" placeholder="you@example.com"
                        value={form.email} onChange={handleChange} autoComplete="email" />
                      {errors.email && <span className="su-err">{errors.email}</span>}
                    </div>
                    <div className="su-field">
                      <label className="su-label">Password</label>
                      <div className="su-input-wrap">
                        <input className={`su-input pw${errors.password?" e":""}`}
                          type={showPw?"text":"password"} name="password"
                          placeholder="Min. 8 characters" value={form.password}
                          onChange={handleChange} autoComplete="new-password" />
                        <button type="button" className="su-pw-eye"
                          onClick={() => setShowPw(v=>!v)} tabIndex={-1}>
                          {showPw?"🙈":"👁"}
                        </button>
                      </div>
                      {form.password && (
                        <div className="su-strength">
                          <div className="su-strength-bar">
                            <div className="su-strength-fill"
                              style={{ width:`${strength*25}%`, background:strengthColor }} />
                          </div>
                          <span style={{ fontSize:11.5, fontWeight:500, color:strengthColor }}>
                            {strengthLabel}
                          </span>
                        </div>
                      )}
                      {errors.password && <span className="su-err">{errors.password}</span>}
                    </div>
                    <div className="su-field">
                      <label className="su-label">Confirm Password</label>
                      <div className="su-input-wrap">
                        <input className={`su-input pw${errors.confirmPassword?" e":""}`}
                          type={showCp?"text":"password"} name="confirmPassword"
                          placeholder="Re-enter password" value={form.confirmPassword}
                          onChange={handleChange} autoComplete="new-password" />
                        <button type="button" className="su-pw-eye"
                          onClick={() => setShowCp(v=>!v)} tabIndex={-1}>
                          {showCp?"🙈":"👁"}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="su-err">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="su-submit" disabled={loading}>
                      {loading
                        ? <><div className="su-spinner"/>Sending OTP…</>
                        : "Continue → Verify Email"}
                    </button>
                  </form>

                  <div className="su-divider">or</div>
                  <div className="su-signin">Already have an account? <Link to="/login">Sign in →</Link></div>
                </motion.div>
              )}

              {/* STEP 1: OTP entry */}
              {step === 1 && (
                <motion.div key="otp"
                  initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:-24 }} transition={{ duration:.28 }}>

                  <h1 className="su-form-title">Check your inbox</h1>
                  <p className="su-form-sub">We emailed a 4-digit code to</p>

                  <div className="otp-card">
                    <div className="otp-email-chip">📧 {form.email}</div>
                    <p className="otp-hint">Enter the code below. It expires in 10 minutes.</p>

                    <OtpInput value={otp} onChange={setOtp} disabled={otpLoading} />

                    {otpError && <div className="otp-err">⚠ {otpError}</div>}

                    <button
                      className="su-submit"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.replace(/\s/g,"").length < 4}
                    >
                      {otpLoading
                        ? <><div className="su-spinner"/>Verifying…</>
                        : "Verify & Create Account →"}
                    </button>

                    <div className="otp-resend">
                      {resendSecs > 0
                        ? <span>Resend in <strong>{resendSecs}s</strong></span>
                        : <span>Didn't get it? <button onClick={handleResend}>Resend OTP</button></span>
                      }
                    </div>
                    <div>
                      <button className="otp-back"
                        onClick={() => { setStep(0); setOtp(""); setOtpError(""); }}>
                        ← Back to edit details
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: success */}
              {step === 2 && (
                <motion.div key="success"
                  initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
                  transition={{ duration:.4, type:"spring", bounce:.3 }}>

                  <div className="success-card">
                    <motion.div className="success-icon"
                      initial={{ scale:0 }} animate={{ scale:1 }}
                      transition={{ delay:.15, type:"spring", bounce:.5 }}>
                      🌱
                    </motion.div>
                    <h2 className="success-title">Account created!</h2>
                    <p className="success-sub">
                      Welcome to TerraSpotter, <strong>{form.fname}</strong>! 🎉<br />
                      A confirmation email has been sent to<br />
                      <strong>{form.email}</strong>
                    </p>
                    <Link to="/login" className="success-btn">
                      Sign in to your account →
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}