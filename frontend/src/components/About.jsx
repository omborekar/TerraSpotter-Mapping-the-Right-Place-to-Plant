import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// static (keep these)
const team = [
  { initials: "OB", name: "Om Borekar",        role: "Full Stack Developer",   color: "#2d6a4f" },
  { initials: "VK", name: "Vishwaja Kakulate", role: "Backend Developer",      color: "#3a8c57" },
  { initials: "PD", name: "Prasad Dhotre",     role: "Database Engineer",      color: "#40916c" },
  { initials: "PG", name: "Pradnya Gajre",     role: "Frontend Developer",     color: "#52b788" },
];

const values = [
  { icon: "🌍", title: "Data-Driven", desc: "Every recommendation is backed by real climate, soil, and rainfall data." },
  { icon: "🤝", title: "Community-Led", desc: "Local volunteers and landowners drive plantation." },
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

export default function About() {

  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // 🔥 FETCH REAL DATA
  useEffect(() => {
    axios.get(`${BASE_URL}/api/stats`)
      .then(res => {
        const d = res.data;

        setStats([
          { value: d.lands + "+", label: "Hectares Mapped" },
          { value: d.verified + "+", label: "Verified Sites" },
          { value: d.trees + "+", label: "Trees Planted" },
          { value: d.districts, label: "Districts Covered" },
        ]);
      })
      .catch(() => {
        // fallback (in case backend fails)
        setStats([
          { value: "—", label: "Hectares Mapped" },
          { value: "—", label: "Verified Sites" },
          { value: "—", label: "Trees Planted" },
          { value: "—", label: "Districts Covered" },
        ]);
      })
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <>
      <div className="ab-page">

        {/* HERO */}
        <motion.div className="ab-hero"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <div className="ab-hero-tag">🌿 About TerraSpotter</div>
          <h1>Turning idle land into<br />living forests</h1>
          <p>TerraSpotter identifies and activates barren land for plantation using real data and community effort.</p>

          <div className="ab-hero-cta">
            <Link to="/browse" className="ab-btn-primary">Browse Sites →</Link>
            <Link to="/main"   className="ab-btn-ghost">Submit Land</Link>
          </div>
        </motion.div>

        {/* 🔥 STATS (NOW DYNAMIC) */}
        <motion.div className="ab-stats"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>

          {loadingStats ? (
            <div style={{ width:"100%", textAlign:"center" }}>
              Loading impact data 🌱...
            </div>
          ) : (
            stats.map((s, i) => (
              <div key={i} className="ab-stat">
                <div className="ab-stat-val">{s.value}</div>
                <div className="ab-stat-lbl">{s.label}</div>
              </div>
            ))
          )}
        </motion.div>

        {/* MISSION */}
        <div className="ab-section">
          <div className="ab-section-label">Our Mission</div>
          <h2 className="ab-section-title">Restore ecology, one plot at a time</h2>
          <p className="ab-section-desc">
            Millions of land parcels sit unused. TerraSpotter helps identify and convert them into green zones.
          </p>
        </div>

        {/* VALUES */}
        <div className="ab-section">
          <div className="ab-section-label">What We Stand For</div>
          <h2 className="ab-section-title">Our values</h2>

          <div className="ab-values-grid">
            {values.map((v, i) => (
              <div key={i} className="ab-value-card">
                <div>{v.icon}</div>
                <div>{v.title}</div>
                <div>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE */}
        <div className="ab-section">
          <div className="ab-section-label">Our Journey</div>
          <h2 className="ab-section-title">How we got here</h2>

          {timeline.map((t, i) => (
            <div key={i}>
              <strong>{t.year}</strong> — {t.text}
            </div>
          ))}
        </div>

        {/* TEAM */}
        <div className="ab-section">
          <div className="ab-section-label">The People</div>
          <h2 className="ab-section-title">Who builds this</h2>

          <div className="ab-team-grid">
            {team.map((t, i) => (
              <div key={i} className="ab-team-card">
                <div className="ab-team-avatar" style={{ background:t.color }}>
                  {t.initials}
                </div>
                <div>{t.name}</div>
                <div>{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="ab-cta">
          <h2>Ready to make a difference?</h2>
          <p>Submit land or explore plantation sites.</p>

          <Link to="/browse" className="ab-btn-primary">
            Browse Plantation Sites
          </Link>
        </div>

      </div>
    </>
  );
}