/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Landing page React component (hero, features, stats, CTA).
*/
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_URL;

const Landing = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  /* subtle animated dot grid on canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const gap = 36;
      const cols = Math.ceil(width  / gap);
      const rows = Math.ceil(height / gap);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gap + gap / 2;
          const y = r * gap + gap / 2;
          const dist = Math.sqrt((x - width * .6) ** 2 + (y - height * .5) ** 2);
          const pulse = Math.sin(dist / 60 - t * 1.2) * .5 + .5;
          const alpha = pulse * 0.18;
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(77,184,122,${alpha})`;
          ctx.fill();
        }
      }
      t += 0.016;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const stagger = (i) => ({ initial:{ opacity:0, y:24 }, animate:{ opacity:1, y:0 }, transition:{ duration:.55, delay: i * .1, ease:"easeOut" } });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,600;1,9..144,400;1,9..144,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest:#0d3320; --canopy:#1a5c38; --leaf:#2d8a55; --sprout:#4db87a;
          --mist:#e8f5ee; --sand:#f5f1eb; --cream:#faf8f4;
          --ink:#0f1a14; --smoke:#6b7a72; --line:#dde5e0; --white:#ffffff;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); }

        /* hero */
        .ln-hero {
          min-height: 100vh;
          background: var(--forest);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }
        .ln-canvas {
          position: absolute; inset: 0; width: 100%; height: 100%;
          pointer-events: none;
        }

        /* diagonal cut at bottom */
        .ln-hero::after {
          content: '';
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 120px;
          background: var(--sand);
          clip-path: polygon(0 100%, 100% 0, 100% 100%);
        }

        .ln-hero-inner {
          max-width: 1180px; margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative; z-index: 1;
        }

        /* left */
        .ln-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11.5px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 2px; color: var(--sprout); margin-bottom: 24px;
        }
        .ln-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--sprout); animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }

        .ln-h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(48px, 6vw, 72px);
          font-weight: 600;
          letter-spacing: -1px;
          line-height: 1.06;
          color: white;
          margin-bottom: 8px;
        }
        .ln-h1 em { font-style: italic; color: var(--sprout); }

        .ln-sub {
          font-size: 17px; color: rgba(255,255,255,.55);
          line-height: 1.75; margin-bottom: 40px; max-width: 460px;
        }

        .ln-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .ln-btn-primary {
          padding: 14px 30px; border-radius: 8px;
          background: var(--sprout); color: var(--forest);
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          border: none; cursor: pointer; transition: background .15s, transform .1s;
          letter-spacing: .2px;
        }
        .ln-btn-primary:hover { background: #5dcf8a; }
        .ln-btn-primary:active { transform: scale(.98); }
        .ln-btn-ghost {
          padding: 14px 28px; border-radius: 8px;
          background: rgba(255,255,255,.08); color: rgba(255,255,255,.75);
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          border: 1.5px solid rgba(255,255,255,.15); cursor: pointer;
          transition: background .15s, border-color .15s;
        }
        .ln-btn-ghost:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.3); }

        /* right visual */
        .ln-visual {
          display: flex; flex-direction: column; gap: 14px;
        }
        .ln-card-main {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 16px; padding: 24px 26px;
          backdrop-filter: blur(8px);
        }
        .ln-card-main-label {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1.5px; color: var(--sprout); margin-bottom: 14px;
        }
        .ln-map-mock {
          height: 180px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(13,51,32,.8), rgba(45,138,85,.3));
          border: 1px solid rgba(77,184,122,.2);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .ln-map-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(77,184,122,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77,184,122,.08) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .ln-map-pin {
          position: absolute;
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--sprout); box-shadow: 0 0 0 4px rgba(77,184,122,.25);
        }
        .ln-map-pin.p1 { top: 35%; left: 28%; }
        .ln-map-pin.p2 { top: 55%; left: 58%; }
        .ln-map-pin.p3 { top: 28%; left: 65%; }
        .ln-map-pin.p4 { top: 65%; left: 38%; }

        .ln-card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ln-mini-card {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px; padding: 16px 18px;
        }
        .ln-mini-num {
          font-family: 'Fraunces', serif; font-size: 26px;
          color: var(--sprout); line-height: 1;
        }
        .ln-mini-lbl {
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 1px; color: rgba(255,255,255,.35); margin-top: 4px;
        }

        /* stats bar */
        .ln-stats-bar {
          background: var(--forest);
          border-bottom: 1px solid rgba(255,255,255,.06);
          position: relative; z-index: 1;
        }
        .ln-stats-inner {
          max-width: 1180px; margin: 0 auto; padding: 32px 48px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0; border-top: 1px solid rgba(255,255,255,.07);
        }
        .ln-stat-item {
          padding: 0 32px; border-right: 1px solid rgba(255,255,255,.07);
          display: flex; flex-direction: column; gap: 4px;
        }
        .ln-stat-item:first-child { padding-left: 0; }
        .ln-stat-item:last-child  { border-right: none; }
        .ln-stat-n {
          font-family: 'Fraunces', serif; font-size: 36px;
          color: var(--sprout); line-height: 1; letter-spacing: -1px;
        }
        .ln-stat-l { font-size: 12.5px; color: rgba(255,255,255,.4); }

        /* features */
        .ln-features {
          max-width: 1180px; margin: 0 auto;
          padding: 100px 48px 80px;
        }
        .ln-features-head { margin-bottom: 64px; }
        .ln-features-eyebrow {
          font-size: 11.5px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 2px; color: var(--leaf); margin-bottom: 14px;
        }
        .ln-features-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(32px, 4vw, 48px); font-weight: 600;
          letter-spacing: -.5px; color: var(--forest); line-height: 1.12;
          max-width: 520px;
        }
        .ln-features-h2 em { font-style: italic; color: var(--leaf); }

        .ln-features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .ln-feature-card {
          background: var(--white); border: 1px solid var(--line);
          border-radius: 16px; padding: 32px 28px;
          display: flex; flex-direction: column; gap: 14px;
          transition: box-shadow .2s, transform .2s;
        }
        .ln-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(13,51,32,.1);
        }
        .ln-feature-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--mist); display: flex;
          align-items: center; justify-content: center; font-size: 22px;
        }
        .ln-feature-h3 {
          font-size: 17px; font-weight: 600; color: var(--forest);
        }
        .ln-feature-p {
          font-size: 14px; color: var(--smoke); line-height: 1.7;
        }
        .ln-feature-link {
          font-size: 13px; font-weight: 600; color: var(--leaf);
          background: none; border: none; cursor: pointer;
          padding: 0; font-family: 'DM Sans', sans-serif;
          margin-top: auto; text-align: left; transition: color .15s;
        }
        .ln-feature-link:hover { color: var(--forest); }

        /* how it works */
        .ln-how {
          background: var(--forest);
          padding: 100px 0;
          position: relative; overflow: hidden;
        }
        .ln-how::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 50%, rgba(77,184,122,.12), transparent 60%);
          pointer-events: none;
        }
        .ln-how-inner {
          max-width: 1180px; margin: 0 auto; padding: 0 48px;
          position: relative; z-index: 1;
        }
        .ln-how-eyebrow {
          font-size: 11.5px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 2px; color: var(--sprout); margin-bottom: 14px;
        }
        .ln-how-h2 {
          font-family: 'Fraunces', serif; font-size: clamp(30px, 4vw, 44px);
          font-weight: 600; color: white; letter-spacing: -.4px;
          margin-bottom: 64px; max-width: 480px;
        }
        .ln-how-h2 em { font-style: italic; color: var(--sprout); }

        .ln-steps {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          position: relative;
        }
        .ln-steps::before {
          content: '';
          position: absolute; top: 20px; left: 10%; right: 10%;
          height: 1px; background: rgba(255,255,255,.1);
        }
        .ln-step { padding: 0 20px 0 0; }
        .ln-step-num {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(77,184,122,.15); border: 1.5px solid rgba(77,184,122,.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-size: 16px;
          color: var(--sprout); margin-bottom: 20px;
          position: relative; z-index: 1;
        }
        .ln-step h4 { font-size: 15px; font-weight: 600; color: white; margin-bottom: 8px; }
        .ln-step p  { font-size: 13.5px; color: rgba(255,255,255,.5); line-height: 1.65; }

        /* cta banner */
        .ln-cta-section {
          max-width: 1180px; margin: 0 auto; padding: 100px 48px 120px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .ln-cta-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(36px, 5vw, 60px); font-weight: 600;
          letter-spacing: -.5px; color: var(--forest); line-height: 1.1;
          margin-bottom: 20px; max-width: 640px;
        }
        .ln-cta-h2 em { font-style: italic; color: var(--leaf); }
        .ln-cta-sub {
          font-size: 16px; color: var(--smoke); margin-bottom: 40px; max-width: 480px; line-height: 1.7;
        }
        .ln-cta-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .ln-cta-primary {
          padding: 15px 36px; border-radius: 8px;
          background: var(--forest); color: white;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          border: none; cursor: pointer; transition: background .15s, transform .1s;
        }
        .ln-cta-primary:hover { background: var(--canopy); }
        .ln-cta-primary:active { transform: scale(.98); }
        .ln-cta-secondary {
          padding: 15px 32px; border-radius: 8px;
          background: white; color: var(--forest);
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          border: 1.5px solid var(--line); cursor: pointer; transition: border-color .15s;
        }
        .ln-cta-secondary:hover { border-color: var(--forest); }

        /* footer */
        .ln-footer {
          background: var(--forest); border-top: 1px solid rgba(255,255,255,.06);
          padding: 32px 48px;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 100%; font-size: 13px; color: rgba(255,255,255,.3);
          font-family: 'DM Sans', sans-serif;
        }
        .ln-footer-brand {
          font-family: 'Fraunces', serif; font-size: 18px;
          color: white; display: flex; align-items: center; gap: 8px;
        }
        .ln-footer-pip {
          width: 7px; height: 7px; border-radius: 50%; background: var(--sprout);
        }

        @media(max-width:900px){
          .ln-hero-inner { grid-template-columns:1fr; padding: 0 24px; }
          .ln-visual { display: none; }
          .ln-stats-inner { grid-template-columns:1fr 1fr; gap:24px; padding:32px 24px; }
          .ln-stat-item { border-right:none; padding:0; }
          .ln-features, .ln-how-inner, .ln-cta-section { padding-left:24px; padding-right:24px; }
          .ln-features-grid { grid-template-columns:1fr; }
          .ln-steps { grid-template-columns:1fr 1fr; gap:32px; }
          .ln-steps::before { display:none; }
          .ln-footer { flex-direction:column; gap:12px; text-align:center; padding:24px; }
        }
      `}</style>

      {/* hero */}
      <section className="ln-hero">
        <canvas ref={canvasRef} className="ln-canvas" />

        <div className="ln-hero-inner">
          {/* left */}
          <div>
            <motion.div {...stagger(0)}>
              <div className="ln-eyebrow">
                <span className="ln-eyebrow-dot" />
                Sustainable Infrastructure Platform
              </div>
            </motion.div>

            <motion.h1 className="ln-h1" {...stagger(1)}>
              Map land.<br /><em>Grow forests.</em><br />Track impact.
            </motion.h1>

            <motion.p className="ln-sub" {...stagger(2)}>
              TerraSpotter connects land, people, and intelligence to enable
              scalable, transparent afforestation — from boundary to canopy.
            </motion.p>

            <motion.div className="ln-cta-row" {...stagger(3)}>
              <button className="ln-btn-primary" onClick={() => navigate("/signup")}>
                Start mapping →
              </button>
              <button className="ln-btn-ghost" onClick={() => navigate("/browse")}>
                Browse lands
              </button>
            </motion.div>
          </div>

          {/* right visual */}
          <motion.div className="ln-visual"
            initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:.7, delay:.2 }}>
            <div className="ln-card-main">
              <div className="ln-card-main-label">Live land map</div>
              <div className="ln-map-mock">
                <div className="ln-map-grid" />
                <div className="ln-map-pin p1" />
                <div className="ln-map-pin p2" />
                <div className="ln-map-pin p3" />
                <div className="ln-map-pin p4" />
              </div>
            </div>
            <div className="ln-card-row">
              <div className="ln-mini-card">
                <div className="ln-mini-num">2.4k</div>
                <div className="ln-mini-lbl">Lands mapped</div>
              </div>
              <div className="ln-mini-card">
                <div className="ln-mini-num">18k</div>
                <div className="ln-mini-lbl">Trees planted</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* stats bar */}
      <div className="ln-stats-bar">
        <div className="ln-stats-inner">
          {[
            { n:"2,400+", l:"Land parcels mapped" },
            { n:"18,000", l:"Trees planted" },
            { n:"62 t",   l:"CO₂ captured" },
            { n:"340",    l:"Active volunteers" },
          ].map((s,i) => (
            <motion.div key={i} className="ln-stat-item"
              initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:.4, delay:i*.08 }}>
              <div className="ln-stat-n">{s.n}</div>
              <div className="ln-stat-l">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* features */}
      <div style={{ background:"var(--sand)" }}>
        <section className="ln-features">
          <motion.div className="ln-features-head"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:.5 }}>
            <div className="ln-features-eyebrow">What we do</div>
            <h2 className="ln-features-h2">
              Everything a plantation<br />initiative <em>actually needs</em>
            </h2>
          </motion.div>

          <div className="ln-features-grid">
            {[
              {
                icon:"🗺️",
                title:"Verified land discovery",
                desc:"Identify and validate plantation-ready land using geo-tagged submissions, polygon mapping, and community review.",
                cta:"Browse lands",
                path:"/browse",
              },
              {
                icon:"🌿",
                title:"AI species recommendations",
                desc:"Optimal tree species and planting density based on soil type, local rainfall, temperature range, and land condition.",
                cta:"Learn more",
                path:"/browse",
              },
              {
                icon:"📊",
                title:"Transparent impact tracking",
                desc:"Track plantations over time with boundary maps, photo logs, volunteer contributions, and CO₂ estimates.",
                cta:"See how",
                path:"/browse",
              },
            ].map((f,i) => (
              <motion.div key={i} className="ln-feature-card"
                initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:.45, delay:i*.1 }}>
                <div className="ln-feature-icon">{f.icon}</div>
                <h3 className="ln-feature-h3">{f.title}</h3>
                <p className="ln-feature-p">{f.desc}</p>
                <button className="ln-feature-link" onClick={() => navigate(f.path)}>
                  {f.cta} →
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* how it works */}
      <section className="ln-how">
        <div className="ln-how-inner">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:.5 }}>
            <div className="ln-how-eyebrow">Process</div>
            <h2 className="ln-how-h2">From empty land<br />to <em>living forest</em></h2>
          </motion.div>

          <div className="ln-steps">
            {[
              { n:"1", title:"Submit land", desc:"Draw the boundary on the map, upload photos, and fill in land details." },
              { n:"2", title:"Get recommendations", desc:"AI fetches soil and climate data, recommends native species and planting density." },
              { n:"3", title:"Match with teams", desc:"Land is matched with local volunteers, NGOs, or institutions ready to plant." },
              { n:"4", title:"Track growth", desc:"Ongoing photo verification and satellite comparison track canopy growth over time." },
            ].map((s,i) => (
              <motion.div key={i} className="ln-step"
                initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:.45, delay:i*.1 }}>
                <div className="ln-step-num">{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section style={{ background:"var(--sand)" }}>
        <motion.div className="ln-cta-section"
          initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:.55 }}>
          <h2 className="ln-cta-h2">
            Every boundary you draw<br />becomes a <em>forest tomorrow</em>
          </h2>
          <p className="ln-cta-sub">
            Join researchers, NGOs, students, and volunteers building
            verifiable green impact across India — one parcel at a time.
          </p>
          <div className="ln-cta-btns">
            <button className="ln-cta-primary" onClick={() => navigate("/signup")}>
              Create free account →
            </button>
            <button className="ln-cta-secondary" onClick={() => navigate("/browse")}>
              Explore lands
            </button>
          </div>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="ln-footer">
        <div className="ln-footer-brand">
          <span className="ln-footer-pip" /> TerraSpotter
        </div>
        <span>Built for communities committed to sustainable afforestation.</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </>
  );
};

export default Landing;