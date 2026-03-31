import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const team = [
  { initials: "OB", name: "Om Borekar",        role: "Full Stack Developer",   color: "#2d6a4f" },
  { initials: "VK", name: "Vishwaja Kakulate", role: "Backend Developer",      color: "#3a8c57" },
  { initials: "PD", name: "Prasad Dhotre",     role: "Database Engineer",      color: "#40916c" },
  { initials: "PG", name: "Pradnya Gajre",     role: "Frontend Developer",     color: "#52b788" },
];

const values = [
  { icon: "🌍", title: "Data-Driven",    desc: "Every recommendation is backed by real climate, soil, and rainfall data — not guesswork." },
  { icon: "🤝", title: "Community-Led",  desc: "Local volunteers, NGOs, and landowners drive every plantation." },
  { icon: "🔍", title: "Transparent",    desc: "All submissions and outcomes are visible." },
  { icon: "🌱", title: "Native-First",   desc: "We prioritise indigenous tree species." },
];

const timeline = [
  { year: "2025", text: "Initiated as a final-year BE project solving real-world plantation challenges." },
  { year: "Planning", text: "Designed a system to crowdsource land data for plantation." },
  { year: "Development", text: "Built TerraSpotter with mapping, uploads, and validation features." },
  { year: "Integration", text: "Added ML-based plant recommendation logic." },
  { year: "Current", text: "Improving usability and real-world impact." },
];

export default function About() {

  // 🔥 dynamic stats
  const [stats, setStats] = useState([
    { value: "2,400+", label: "Hectares Mapped" },
    { value: "180+",   label: "Verified Sites" },
    { value: "3,200+", label: "Trees Planted" },
    { value: "12",     label: "Districts Covered" },
  ]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(res => {
        const d = res.data;

        setStats([
          { value: d.lands + "+", label: "Hectares Mapped" },
          { value: d.verified + "+", label: "Verified Sites" },
          { value: d.trees.toLocaleString() + "+", label: "Trees Planted" },
          { value: d.districts || "—", label: "Districts Covered" },
        ]);
      })
      .catch(() => {
        console.log("Stats fetch failed");
      });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

        body { font-family:'DM Sans',sans-serif; background:#f7f3ee; color:#1a1a1a; }

        .ab-page { max-width:1100px;margin:0 auto;padding:64px 36px 100px; }

        .ab-hero { text-align:center;margin-bottom:72px; }
        .ab-hero h1 { font-family:'Fraunces';font-size:52px;color:#0d3320;margin-bottom:18px; }
        .ab-hero p { color:#6b7280;max-width:600px;margin:0 auto 24px; }

        .ab-btn-primary { padding:12px 28px;background:#0d3320;color:white;border-radius:10px;text-decoration:none; }
        .ab-btn-ghost { padding:12px 28px;border:1px solid #ccc;border-radius:10px;margin-left:10px;text-decoration:none; }

        .ab-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:72px; }
        .ab-stat { background:white;border-radius:14px;padding:24px;text-align:center; }
        .ab-stat-val { font-family:'Fraunces';font-size:36px;color:#0d3320; }
        .ab-stat-lbl { font-size:13px;color:#6b7280; }

        .ab-section { margin-bottom:72px; }
        .ab-section-title { font-family:'Fraunces';font-size:32px;color:#0d3320;margin-bottom:14px; }

        .ab-values-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:16px; }
        .ab-value-card { background:white;padding:20px;border-radius:12px; }

        .ab-team-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .ab-team-card { background:white;padding:24px;border-radius:12px;text-align:center; }

        .ab-team-avatar {
          width:56px;height:56px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:white;margin:0 auto 12px;font-weight:600;
        }
      `}</style>

      <div className="ab-page">

        {/* HERO */}
        <motion.div className="ab-hero"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <h1>Turning idle land into<br />living forests</h1>
          <p>TerraSpotter identifies and activates barren land for plantation using real data and community effort.</p>

          <Link to="/browse" className="ab-btn-primary">Browse Sites →</Link>
          <Link to="/main" className="ab-btn-ghost">Submit Land</Link>
        </motion.div>

        {/* STATS */}
        <motion.div className="ab-stats"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
          {stats.map((s, i) => (
            <div key={i} className="ab-stat">
              <div className="ab-stat-val">{s.value}</div>
              <div className="ab-stat-lbl">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* VALUES */}
        <div className="ab-section">
          <h2 className="ab-section-title">Our Values</h2>
          <div className="ab-values-grid">
            {values.map((v,i)=>(
              <div key={i} className="ab-value-card">
                <div>{v.icon}</div>
                <div><b>{v.title}</b></div>
                <div>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE */}
        <div className="ab-section">
          <h2 className="ab-section-title">Journey</h2>
          {timeline.map((t,i)=>(
            <div key={i}><b>{t.year}</b> — {t.text}</div>
          ))}
        </div>

        {/* TEAM */}
        <div className="ab-section">
          <h2 className="ab-section-title">Team</h2>
          <div className="ab-team-grid">
            {team.map((t,i)=>(
              <div key={i} className="ab-team-card">
                <div className="ab-team-avatar" style={{background:t.color}}>
                  {t.initials}
                </div>
                <div>{t.name}</div>
                <div>{t.role}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}