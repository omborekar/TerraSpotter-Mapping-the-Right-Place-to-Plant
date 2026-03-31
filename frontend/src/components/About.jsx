import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function About() {

  // 🔥 dynamic stats
  const [stats, setStats] = useState([
    { value: "...", label: "Hectares Mapped" },
    { value: "...", label: "Verified Sites" },
    { value: "...", label: "Trees Planted" },
    { value: "...", label: "Districts Covered" },
  ]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(res => {
        const d = res.data;

        setStats([
          { value: d.lands + "+", label: "Hectares Mapped" },
          { value: d.verified + "+", label: "Verified Sites" },
          { value: d.trees.toLocaleString() + "+", label: "Trees Planted" },
          { value: d.districts, label: "Districts Covered" },
        ]);
      })
      .catch(() => {
        console.log("Stats fetch failed");
      });
  }, []);

  // 🔒 unchanged
  const team = [
    { initials: "OB", name: "Om Borekar", role: "Full Stack Developer", color: "#2d6a4f" },
    { initials: "VK", name: "Vishwaja Kakulate", role: "Backend Developer", color: "#3a8c57" },
    { initials: "PD", name: "Prasad Dhotre", role: "Database Engineer", color: "#40916c" },
    { initials: "PG", name: "Pradnya Gajre", role: "Frontend Developer", color: "#52b788" },
  ];

  const values = [
    { icon: "🌍", title: "Data-Driven", desc: "Every recommendation is backed by real climate, soil, and rainfall data — not guesswork." },
    { icon: "🤝", title: "Community-Led", desc: "Local volunteers and landowners drive every plantation." },
    { icon: "🔍", title: "Transparent", desc: "All submissions and outcomes are visible." },
    { icon: "🌱", title: "Native-First", desc: "We prioritise indigenous tree species." },
  ];

  const timeline = [
    { year: "2025", text: "Started as final-year BE project solving real plantation challenges." },
    { year: "Planning", text: "Designed system for crowd-based land mapping." },
    { year: "Development", text: "Built with MERN stack + mapping + uploads." },
    { year: "Integration", text: "ML-based plant recommendation added." },
    { year: "Current", text: "Improving accuracy & real-world impact." },
  ];

  return (
    <>
      <style>{`
        body { background:#f7f3ee; }
        .ab-page { max-width:1100px;margin:0 auto;padding:64px 36px 100px; }

        .ab-hero { text-align:center;margin-bottom:72px; }
        .ab-hero h1 { font-size:48px;color:#0d3320;margin-bottom:18px; }
        .ab-hero p { color:#6b7280;margin-bottom:24px; }

        .ab-btn-primary { padding:12px 24px;background:#0d3320;color:white;border-radius:8px;text-decoration:none; }
        .ab-btn-ghost { padding:12px 24px;border:1px solid #ccc;border-radius:8px;text-decoration:none;margin-left:10px; }

        .ab-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:72px; }
        .ab-stat { background:white;padding:24px;border-radius:12px;text-align:center; }
        .ab-stat-val { font-size:32px;color:#0d3320; }
        .ab-stat-lbl { font-size:13px;color:#6b7280; }

        .ab-section { margin-bottom:72px; }
        .ab-section-title { font-size:28px;color:#0d3320;margin-bottom:14px; }

        .ab-team-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .ab-team-card { background:white;padding:20px;border-radius:12px;text-align:center; }

        .ab-team-avatar {
          width:50px;height:50px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:white;margin:0 auto 10px;
        }
      `}</style>

      <div className="ab-page">

        {/* HERO */}
        <motion.div className="ab-hero"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <h1>Turning idle land into forests</h1>
          <p>TerraSpotter connects unused land with plantation opportunities using real data.</p>

          <Link to="/browse" className="ab-btn-primary">Browse</Link>
          <Link to="/main" className="ab-btn-ghost">Submit</Link>
        </motion.div>

        {/* 🔥 STATS (UI SAME, DATA REAL) */}
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
          {values.map((v,i)=>(
            <div key={i}>{v.icon} {v.title} - {v.desc}</div>
          ))}
        </div>

        {/* TIMELINE */}
        <div className="ab-section">
          <h2 className="ab-section-title">Journey</h2>
          {timeline.map((t,i)=>(
            <div key={i}><b>{t.year}</b> - {t.text}</div>
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