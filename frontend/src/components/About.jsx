import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_URL;

const stats = [
  { value: "2,400+", label: "Hectares Mapped" },
  { value: "180+",   label: "Verified Sites" },
  { value: "3,200+", label: "Trees Planted" },
  { value: "12",     label: "Districts Covered" },
];

const team = [
  { initials: "OB", name: "Om Borekar",        role: "Full Stack Developer",   color: "#2d6a4f" },
  { initials: "VK", name: "Vishwaja Kakulate", role: "Backend Developer",      color: "#3a8c57" },
  { initials: "PD", name: "Prasad Dhotre",     role: "Database Engineer",      color: "#40916c" },
  { initials: "PG", name: "Pradnya Gajre",     role: "Frontend Developer",     color: "#52b788" },
];

const values = [
  { icon: "🌍", title: "Data-Driven",    desc: "Every recommendation is backed by real climate, soil, and rainfall data — not guesswork." },
  { icon: "🤝", title: "Community-Led",  desc: "Local volunteers, NGOs, and landowners drive every plantation. We just connect the dots." },
  { icon: "🔍", title: "Transparent",    desc: "All land submissions, approvals, and plantation outcomes are visible to the public." },
  { icon: "🌱", title: "Native-First",   desc: "We prioritise indigenous tree species that restore local ecology rather than monocultures." },
];

const timeline = [
  { year: "2025", text: "Initiated as a final-year BE Computer Engineering project focused on solving real-world environmental challenges." },
  { year: "Planning", text: "Researched plantation challenges and designed a system to crowdsource location-based data for better decision-making." },
  { year: "Development", text: "Built TerraSpotter using MERN stack with features like map-based tagging, image uploads, and user validation." },
  { year: "Integration", text: "Implemented logic for recommending suitable plants based on environmental factors like soil and climate." },
  { year: "Current", text: "Continuously improving the platform with focus on usability, accuracy, and real-world impact." },
];

export default function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest:#0d3320; --canopy:#1a5c38; --leaf:#2d8a55; --sprout:#4db87a;
          --mist:#e8f5ee; --sand:#f7f3ee; --ink:#1a1a1a; --smoke:#6b7280;
          --line:#e2e8f0; --white:#ffffff;
          --sh:0 2px 16px rgba(13,51,32,0.08);
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); color:var(--ink); }

        .ab-page { max-width:1100px;margin:0 auto;padding:64px 36px 100px; }

        /* ── hero ── */
        .ab-hero { text-align:center;margin-bottom:72px; }
        .ab-hero-tag { display:inline-flex;align-items:center;gap:6px;background:var(--mist);color:var(--canopy);border-radius:20px;padding:5px 14px;font-size:12.5px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;margin-bottom:18px; }
        .ab-hero h1 { font-family:'Fraunces',serif;font-size:52px;font-weight:600;color:var(--forest);letter-spacing:-.6px;line-height:1.1;margin-bottom:18px; }
        .ab-hero p { font-size:17px;color:var(--smoke);line-height:1.75;max-width:620px;margin:0 auto 32px; }
        .ab-hero-cta { display:inline-flex;align-items:center;gap:10px; }
        .ab-btn-primary { padding:13px 28px;background:var(--forest);color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;transition:background .15s; }
        .ab-btn-primary:hover { background:var(--canopy); }
        .ab-btn-ghost { padding:13px 28px;background:white;color:var(--forest);border:1.5px solid var(--line);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:border-color .15s; }
        .ab-btn-ghost:hover { border-color:var(--forest); }

        /* ── stats ── */
        .ab-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:72px; }
        .ab-stat { background:var(--white);border-radius:16px;border:1px solid var(--line);padding:28px 24px;text-align:center;box-shadow:var(--sh); }
        .ab-stat-val { font-family:'Fraunces',serif;font-size:40px;color:var(--forest);line-height:1; }
        .ab-stat-lbl { font-size:13px;color:var(--smoke);margin-top:6px;font-weight:500; }

        /* ── section titles ── */
        .ab-section { margin-bottom:72px; }
        .ab-section-label { font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--leaf);margin-bottom:10px; }
        .ab-section-title { font-family:'Fraunces',serif;font-size:34px;font-weight:600;color:var(--forest);letter-spacing:-.3px;margin-bottom:14px; }
        .ab-section-desc { font-size:15px;color:var(--smoke);line-height:1.7;max-width:580px; }

        /* ── mission ── */
        .ab-mission { display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center; }
        .ab-mission-visual { background:linear-gradient(135deg,#0d3320 0%,#2d8a55 100%);border-radius:20px;padding:40px;display:flex;flex-direction:column;gap:16px; }
        .ab-mission-fact { background:rgba(255,255,255,.1);border-radius:10px;padding:16px 18px; }
        .ab-mission-fact-num { font-family:'Fraunces',serif;font-size:28px;color:white;line-height:1; }
        .ab-mission-fact-txt { font-size:12.5px;color:rgba(255,255,255,.65);margin-top:3px; }

        /* ── values ── */
        .ab-values-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:16px; }
        .ab-value-card { background:var(--white);border-radius:14px;border:1px solid var(--line);padding:24px;box-shadow:var(--sh); }
        .ab-value-icon { font-size:26px;margin-bottom:12px; }
        .ab-value-title { font-size:15px;font-weight:600;color:var(--forest);margin-bottom:6px; }
        .ab-value-desc { font-size:13.5px;color:var(--smoke);line-height:1.65; }

        /* ── timeline ── */
        .ab-timeline { position:relative;padding-left:28px; }
        .ab-timeline::before { content:'';position:absolute;left:7px;top:0;bottom:0;width:2px;background:var(--line);border-radius:2px; }
        .ab-tl-item { position:relative;margin-bottom:32px; }
        .ab-tl-item::before { content:'';position:absolute;left:-24px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--leaf);border:2px solid white;box-shadow:0 0 0 2px var(--leaf); }
        .ab-tl-year { font-size:11.5px;font-weight:700;color:var(--leaf);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px; }
        .ab-tl-text { font-size:14px;color:var(--smoke);line-height:1.65; }

        /* ── team ── */
        .ab-team-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .ab-team-card { background:var(--white);border-radius:14px;border:1px solid var(--line);padding:28px 24px;text-align:center;box-shadow:var(--sh); }
        .ab-team-avatar { width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:white;margin:0 auto 14px; }
        .ab-team-name { font-size:15px;font-weight:600;color:var(--ink);margin-bottom:4px; }
        .ab-team-role { font-size:12.5px;color:var(--smoke); }

        /* ── CTA banner ── */
        .ab-cta { background:linear-gradient(135deg,#0d3320 0%,#1a5c38 100%);border-radius:20px;padding:52px 48px;text-align:center;color:white; }
        .ab-cta h2 { font-family:'Fraunces',serif;font-size:34px;font-weight:600;margin-bottom:12px;letter-spacing:-.3px; }
        .ab-cta p { font-size:15px;color:rgba(255,255,255,.7);margin-bottom:28px;line-height:1.65; }
        .ab-cta-btns { display:flex;gap:12px;justify-content:center;flex-wrap:wrap; }
        .ab-cta-btn-white { padding:13px 28px;background:white;color:var(--forest);border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;transition:opacity .15s; }
        .ab-cta-btn-white:hover { opacity:.9; }
        .ab-cta-btn-outline { padding:13px 28px;background:transparent;color:white;border:1.5px solid rgba(255,255,255,.35);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:border-color .15s; }
        .ab-cta-btn-outline:hover { border-color:rgba(255,255,255,.7); }

        @media(max-width:768px){
          .ab-page { padding:36px 16px 60px; }
          .ab-hero h1 { font-size:34px; }
          .ab-stats { grid-template-columns:1fr 1fr; }
          .ab-mission { grid-template-columns:1fr; }
          .ab-values-grid { grid-template-columns:1fr; }
          .ab-team-grid { grid-template-columns:1fr; }
          .ab-cta { padding:36px 24px; }
        }
      `}</style>

      <div className="ab-page">

        {/* hero */}
        <motion.div className="ab-hero"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}>
          <div className="ab-hero-tag">🌿 About TerraSpotter</div>
          <h1>Turning idle land into<br />living forests</h1>
          <p>TerraSpotter is a community-driven platform that identifies, verifies, and activates barren land parcels for plantation — powered by real climate data and local volunteers.</p>
          <div className="ab-hero-cta">
            <Link to="/browse" className="ab-btn-primary">Browse Sites →</Link>
            <Link to="/main"   className="ab-btn-ghost">Submit Land</Link>
          </div>
        </motion.div>

        {/* stats */}
        <motion.div className="ab-stats"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.1 }}>
          {stats.map((s, i) => (
            <div key={i} className="ab-stat">
              <div className="ab-stat-val">{s.value}</div>
              <div className="ab-stat-lbl">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* mission */}
        <motion.div className="ab-section"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.15 }}>
          <div className="ab-mission">
            <div>
              <div className="ab-section-label">Our Mission</div>
              <h2 className="ab-section-title">Restore ecology,<br />one plot at a time</h2>
              <p className="ab-section-desc">Millions of square metres of land across Maharashtra sit barren — roadsides, vacant plots, unused government land. TerraSpotter makes it easy to find, assess, and plant on these spaces using verified data and community effort.</p>
              <p className="ab-section-desc" style={{ marginTop:14 }}>Our ML model analyses local temperature, rainfall, and soil moisture from Open-Meteo APIs to recommend the most suitable native tree species for each site.</p>
            </div>
            <div className="ab-mission-visual">
              {[
                { num: "28°C", txt: "Avg. temperature analysed per site" },
                { num: "847mm", txt: "Annual rainfall data pulled in real-time" },
                { num: "3 APIs", txt: "Free climate sources — no vendor lock-in" },
              ].map((f, i) => (
                <div key={i} className="ab-mission-fact">
                  <div className="ab-mission-fact-num">{f.num}</div>
                  <div className="ab-mission-fact-txt">{f.txt}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* values */}
        <motion.div className="ab-section"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.2 }}>
          <div className="ab-section-label">What We Stand For</div>
          <h2 className="ab-section-title">Our values</h2>
          <div className="ab-values-grid" style={{ marginTop:24 }}>
            {values.map((v, i) => (
              <div key={i} className="ab-value-card">
                <div className="ab-value-icon">{v.icon}</div>
                <div className="ab-value-title">{v.title}</div>
                <div className="ab-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* timeline */}
        <motion.div className="ab-section"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.22 }}>
          <div className="ab-section-label">Our Journey</div>
          <h2 className="ab-section-title">How we got here</h2>
          <div className="ab-timeline" style={{ marginTop:28 }}>
            {timeline.map((t, i) => (
              <div key={i} className="ab-tl-item">
                <div className="ab-tl-year">{t.year}</div>
                <div className="ab-tl-text">{t.text}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* team */}
        <motion.div className="ab-section display-flex flex-direction-column"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.25 }}>
          <div className="ab-section-label">The People</div>
          <h2 className="ab-section-title">Who builds this</h2>
          <div className="ab-team-grid" style={{ marginTop:24 }}>
            {team.map((t, i) => (
              <div key={i} className="ab-team-card self-center">
                <div className="ab-team-avatar" style={{ background:t.color }}>{t.initials}</div>
                <div className="ab-team-name">{t.name}</div>
                <div className="ab-team-role">{t.role}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="ab-cta"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.28 }}>
          <h2>Ready to make a difference?</h2>
          <p>Submit a land parcel, volunteer to plant, or simply explore verified sites near you.</p>
          <div className="ab-cta-btns">
            <Link to="/browse" className="ab-cta-btn-white">Browse Plantation Sites</Link>
            <Link to="/main"   className="ab-cta-btn-outline">Submit Land →</Link>
          </div>
        </motion.div>

      </div>
    </>
  );
}