import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fname: "", lname: "", email: "",
    phoneNo: "", dob: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.fname.trim().length < 2)  e.fname = "At least 2 characters";
    if (form.lname.trim().length < 2)  e.lname = "At least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!/^\d{10}$/.test(form.phoneNo)) e.phoneNo = "Must be exactly 10 digits";
    if (!form.dob) e.dob = "Date of birth is required";
    if (form.password.length < 8)      e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", {
        fname: form.fname, lname: form.lname, email: form.email,
        phoneNo: form.phoneNo, dob: form.dob, password: form.password,
      }, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      setErrors({ api: err.response?.data || "Signup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  /* password strength */
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)  s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#e53e3e", "#d97706", "#2d8a55", "#0d3320"][strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest: #0d3320; --canopy: #1a5c38; --leaf: #2d8a55; --sprout: #4db87a;
          --mist: #e8f5ee; --sand: #f5f1eb; --cream: #faf8f4;
          --ink: #0f1a14; --smoke: #6b7a72; --line: #dde5e0; --white: #ffffff;
          --danger: #c0392b;
          --sh: 0 2px 20px rgba(13,51,32,.09);
          --sh-lg: 0 12px 52px rgba(13,51,32,.15);
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); color:var(--ink); }

        /* ── layout ── */
        .su-page { min-height:100vh; display:grid; grid-template-columns:420px 1fr; }

        /* ── left ── */
        .su-left {
          background:var(--forest); color:white;
          padding:52px 44px; display:flex; flex-direction:column;
          position:sticky; top:0; height:100vh; overflow-y:auto;
          position:relative; overflow:hidden;
        }
        .su-left::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse at 15% 85%, rgba(77,184,122,.18) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(13,51,32,.55) 0%, transparent 50%);
        }
        .su-left-inner { position:relative;z-index:1;display:flex;flex-direction:column;height:100%; }

        .su-logo {
          font-family:'Fraunces',serif; font-size:22px; font-weight:600;
          letter-spacing:-.2px; color:white; margin-bottom:52px;
          display:flex; align-items:center; gap:10px;
        }
        .su-logo-pip { width:9px;height:9px;border-radius:50%;background:var(--sprout);flex-shrink:0; }

        .su-left h1 {
          font-family:'Fraunces',serif; font-size:36px; font-weight:600;
          line-height:1.12; letter-spacing:-.4px; margin-bottom:16px;
        }
        .su-left h1 em { font-style:italic; color:var(--sprout); }
        .su-left-desc { font-size:14.5px; color:rgba(255,255,255,.6); line-height:1.75; margin-bottom:48px; }

        .su-perks { display:flex; flex-direction:column; gap:16px; margin-bottom:auto; }
        .su-perk { display:flex; align-items:flex-start; gap:12px; }
        .su-perk-dot {
          width:7px; height:7px; border-radius:50%; background:var(--sprout);
          flex-shrink:0; margin-top:6px;
        }
        .su-perk-text h4 { font-size:13.5px; font-weight:600; color:white; margin-bottom:2px; }
        .su-perk-text p  { font-size:12.5px; color:rgba(255,255,255,.5); line-height:1.55; }

        .su-left-foot {
          margin-top:40px; padding-top:24px; border-top:1px solid rgba(255,255,255,.1);
          font-size:12.5px; color:rgba(255,255,255,.3); line-height:1.6;
        }

        /* ── right ── */
        .su-right {
          background:var(--cream); padding:52px 60px 80px;
          display:flex; align-items:flex-start; justify-content:center;
          overflow-y:auto;
        }
        .su-form-wrap { width:100%; max-width:440px; }

        .su-form-title {
          font-family:'Fraunces',serif; font-size:32px; font-weight:600;
          letter-spacing:-.3px; color:var(--forest); margin-bottom:6px;
        }
        .su-form-sub { font-size:14px; color:var(--smoke); margin-bottom:36px; }

        /* ── field ── */
        .su-field { display:flex; flex-direction:column; gap:5px; margin-bottom:16px; }
        .su-label { font-size:12px; font-weight:600; color:#4a5e52; text-transform:uppercase; letter-spacing:.7px; }
        .su-err { font-size:12px; color:var(--danger); margin-top:2px; }

        .su-input-wrap { position:relative; display:flex; align-items:center; }
        .su-input {
          width:100%; padding:11px 14px;
          border:1.5px solid var(--line); border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:14px; color:var(--ink);
          background:var(--white); outline:none;
          transition:border-color .2s, box-shadow .2s;
        }
        .su-input:focus { border-color:var(--leaf); box-shadow:0 0 0 3px rgba(45,138,85,.1); }
        .su-input.e  { border-color:var(--danger); background:#fff8f8; }
        .su-input.pw { padding-right:44px; }

        .su-pw-eye {
          position:absolute; right:12px; background:none; border:none;
          cursor:pointer; font-size:16px; color:var(--smoke); padding:0; line-height:1;
          transition:color .15s;
        }
        .su-pw-eye:hover { color:var(--forest); }

        .su-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

        /* strength bar */
        .su-strength { margin-top:6px; display:flex; flex-direction:column; gap:5px; }
        .su-strength-bar {
          height:3px; border-radius:2px; background:var(--line);
          overflow:hidden;
        }
        .su-strength-fill {
          height:100%; border-radius:2px; transition:width .3s, background .3s;
        }
        .su-strength-label { font-size:11.5px; font-weight:500; }

        /* api error */
        .su-api-err {
          padding:11px 14px; background:#fdf2f2; border:1px solid #fecaca;
          border-radius:8px; font-size:13px; color:var(--danger); margin-bottom:16px;
        }

        /* submit btn */
        .su-submit {
          width:100%; padding:13px; background:var(--forest); color:white;
          border:none; border-radius:8px; font-family:'DM Sans',sans-serif;
          font-size:15px; font-weight:600; cursor:pointer;
          transition:background .15s, transform .1s;
          display:flex; align-items:center; justify-content:center; gap:8px;
          margin-top:4px;
        }
        .su-submit:hover:not(:disabled) { background:var(--canopy); }
        .su-submit:active { transform:scale(.99); }
        .su-submit:disabled { opacity:.65; cursor:not-allowed; }
        .su-spinner {
          width:16px; height:16px; border:2px solid rgba(255,255,255,.3);
          border-top-color:white; border-radius:50%; animation:spin .65s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* divider */
        .su-divider {
          display:flex; align-items:center; gap:12px;
          margin:22px 0; font-size:12.5px; color:var(--smoke);
        }
        .su-divider::before, .su-divider::after {
          content:''; flex:1; height:1px; background:var(--line);
        }

        /* signin link */
        .su-signin { text-align:center; font-size:13.5px; color:var(--smoke); margin-top:22px; }
        .su-signin a { color:var(--leaf); font-weight:600; text-decoration:none; transition:color .15s; }
        .su-signin a:hover { color:var(--forest); }

        /* section header */
        .su-section-head {
          font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:1.2px; color:var(--smoke); margin:20px 0 14px;
          display:flex; align-items:center; gap:10px;
        }
        .su-section-head::after {
          content:''; flex:1; height:1px; background:var(--line);
        }

        @media(max-width:860px){
          .su-page { grid-template-columns:1fr; }
          .su-left { display:none; }
          .su-right { padding:40px 20px 60px; }
        }
      `}</style>

      <div className="su-page">

        {/* ── LEFT ── */}
        <motion.aside className="su-left"
          initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:.55 }}>
          <div className="su-left-inner">
            <div className="su-logo">
              <span className="su-logo-pip" /> TerraSpotter
            </div>

            <h1>Join the<br /><em>green network</em></h1>
            <p className="su-left-desc">
              TerraSpotter brings structure, transparency, and intelligence
              to community-driven afforestation across India.
            </p>

            <div className="su-perks">
              <div className="su-perk">
                <div className="su-perk-dot" />
                <div className="su-perk-text">
                  <h4>Submit & track land parcels</h4>
                  <p>Map boundaries, upload photos, and get matched with planting teams automatically.</p>
                </div>
              </div>
              <div className="su-perk">
                <div className="su-perk-dot" />
                <div className="su-perk-text">
                  <h4>AI-powered species recommendations</h4>
                  <p>Soil type, rainfall, and climate data generate native tree recommendations for every parcel.</p>
                </div>
              </div>
              <div className="su-perk">
                <div className="su-perk-dot" />
                <div className="su-perk-text">
                  <h4>Verified impact tracking</h4>
                  <p>CO₂ capture, canopy growth, and water recharge data updated as plantations mature.</p>
                </div>
              </div>
              <div className="su-perk">
                <div className="su-perk-dot" />
                <div className="su-perk-text">
                  <h4>Open to all — free forever</h4>
                  <p>Built for NGOs, researchers, students, local bodies, and individual volunteers.</p>
                </div>
              </div>
            </div>

            <p className="su-left-foot">
              Your data is used only to connect land with planting teams.<br />
              No ads. No selling. No noise.
            </p>
          </div>
        </motion.aside>

        {/* ── RIGHT ── */}
        <motion.div className="su-right"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:.45, delay:.08 }}>
          <div className="su-form-wrap">

            <h1 className="su-form-title">Create account</h1>
            <p className="su-form-sub">Free forever — takes 60 seconds</p>

            {errors.api && <div className="su-api-err">⚠ {errors.api}</div>}

            <form onSubmit={handleSubmit} noValidate>

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
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={handleChange} autoComplete="new-password" />
                  <button type="button" className="su-pw-eye"
                    onClick={()=>setShowPw(v=>!v)} tabIndex={-1}>
                    {showPw?"🙈":"👁"}
                  </button>
                </div>
                {form.password && (
                  <div className="su-strength">
                    <div className="su-strength-bar">
                      <div className="su-strength-fill"
                        style={{ width:`${strength*25}%`, background:strengthColor }} />
                    </div>
                    <span className="su-strength-label" style={{ color:strengthColor }}>
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
                    placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                  <button type="button" className="su-pw-eye"
                    onClick={()=>setShowCp(v=>!v)} tabIndex={-1}>
                    {showCp?"🙈":"👁"}
                  </button>
                </div>
                {errors.confirmPassword && <span className="su-err">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="su-submit" disabled={loading}>
                {loading
                  ? <><div className="su-spinner"/>Creating account…</>
                  : "Create account →"}
              </button>
            </form>

            <div className="su-divider">or</div>

            <div className="su-signin">
              Already have an account? <Link to="/login">Sign in →</Link>
            </div>

          </div>
        </motion.div>

      </div>
    </>
  );
}