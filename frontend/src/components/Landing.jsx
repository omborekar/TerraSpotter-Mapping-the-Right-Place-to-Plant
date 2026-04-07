/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Landing page React component (hero, features, stats, CTA).
*/
import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

const Landing = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    let t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const gap = 36;
      const cols = Math.ceil(width / gap);
      const rows = Math.ceil(height / gap);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gap + gap / 2;
          const y = r * gap + gap / 2;
          const dist = Math.sqrt((x - width * 0.6) ** 2 + (y - height * 0.5) ** 2);
          const pulse = Math.sin(dist / 60 - t * 1.2) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(77,184,122,${pulse * 0.15})`;
          ctx.fill();
        }
      }
      t += 0.016;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const stagger = (i) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Epilogue:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0e1a12; --ink2: #1e3028; --forest: #0d3320; --canopy: #1a4d2e;
          --leaf: #2d7a4a; --sprout: #4db87a; --cream: #f5f0e8;
          --parchment: #ede7d9; --warm: #8c8678; --line: #d6cfc4;
          --gold: #c9a84c; --gold-lt: #e8d5a3;
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Epilogue', sans-serif; background: var(--cream); color: var(--ink); }

        /* ── HERO ── */
        .ln-hero {
          min-height: 100vh;
          background: var(--forest);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }
        /* grain texture */
        .ln-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35; pointer-events: none; z-index: 0;
        }
        .ln-hero::after {
          content: '';
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 100px;
          background: var(--cream);
          clip-path: polygon(0 100%, 100% 20%, 100% 100%);
          z-index: 2;
        }
        .ln-canvas {
          position: absolute; inset: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
        }

        /* big decorative leaf */
        .ln-leaf-deco {
          position: absolute; right: -60px; top: -80px;
          width: 520px; height: 520px;
          border-radius: 50% 0 50% 0;
          background: rgba(45, 122, 74, 0.08);
          border: 1px solid rgba(77,184,122,0.1);
          transform: rotate(20deg);
          pointer-events: none; z-index: 0;
        }
        .ln-leaf-deco-2 {
          position: absolute; left: -120px; bottom: 60px;
          width: 320px; height: 320px;
          border-radius: 50% 0 50% 0;
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(201,168,76,0.08);
          transform: rotate(-15deg);
          pointer-events: none; z-index: 0;
        }

        .ln-hero-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 64px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 80px;
          align-items: center;
          position: relative; z-index: 1;
          padding-top: 80px; padding-bottom: 120px;
        }

        .ln-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Epilogue', sans-serif;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.28em; color: var(--sprout); margin-bottom: 28px;
        }
        .ln-eyebrow-pip {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--sprout);
          animation: ln-pip 2s ease-in-out infinite;
        }
        @keyframes ln-pip { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.6)} }

        .ln-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(56px, 7.5vw, 96px);
          font-weight: 300;
          letter-spacing: -0.03em;
          line-height: 0.95;
          color: var(--cream);
          margin-bottom: 10px;
        }
        .ln-h1 em { font-style: italic; color: var(--gold-lt); }

        .ln-hero-rule {
          width: 48px; height: 1px;
          background: rgba(77,184,122,0.4);
          margin: 28px 0;
        }

        .ln-sub {
          font-size: 15px; color: rgba(255,255,255,.48);
          line-height: 1.85; margin-bottom: 44px; max-width: 440px;
          font-weight: 300;
        }

        .ln-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .ln-btn-primary {
          padding: 14px 30px;
          background: var(--sprout); color: var(--forest);
          font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          border: none; border-radius: 2px; cursor: pointer;
          transition: background 0.2s, transform 0.12s;
        }
        .ln-btn-primary:hover { background: #62d48e; }
        .ln-btn-primary:active { transform: scale(0.98); }
        .ln-btn-ghost {
          padding: 14px 28px;
          background: transparent; color: rgba(255,255,255,.6);
          font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: 0.05em; text-transform: uppercase;
          border: 1px solid rgba(255,255,255,.18); border-radius: 2px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .ln-btn-ghost:hover {
          background: rgba(255,255,255,.07);
          border-color: rgba(255,255,255,.35);
          color: rgba(255,255,255,.85);
        }

        /* right visual */
        .ln-visual { display: flex; flex-direction: column; gap: 12px; }
        .ln-card-main {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 4px; padding: 24px;
          backdrop-filter: blur(12px);
        }
        .ln-card-label {
          font-family: 'Epilogue', sans-serif;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.25em; color: rgba(77,184,122,0.7); margin-bottom: 14px;
        }
        .ln-map-mock {
          height: 200px; border-radius: 2px;
          background: linear-gradient(140deg, rgba(13,51,32,.9), rgba(45,122,74,.3));
          border: 1px solid rgba(77,184,122,.12);
          position: relative; overflow: hidden;
        }
        .ln-map-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(77,184,122,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77,184,122,.06) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .ln-map-pin {
          position: absolute;
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--sprout);
          box-shadow: 0 0 0 3px rgba(77,184,122,.2), 0 0 12px rgba(77,184,122,.3);
        }
        .ln-map-pin.p1 { top: 35%; left: 28%; }
        .ln-map-pin.p2 { top: 55%; left: 58%; }
        .ln-map-pin.p3 { top: 28%; left: 65%; }
        .ln-map-pin.p4 { top: 68%; left: 38%; }
        .ln-map-pin.p5 { top: 45%; left: 45%; }

        .ln-card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ln-mini {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 4px; padding: 18px 20px;
        }
        .ln-mini-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px; font-weight: 600;
          color: var(--cream); line-height: 1;
          letter-spacing: -0.02em;
        }
        .ln-mini-lbl {
          font-size: 9px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.2em; color: rgba(255,255,255,.3); margin-top: 5px;
        }

        /* ── STATS BELT ── */
        .ln-stats-belt {
          background: var(--forest);
          border-top: 1px solid rgba(255,255,255,.06);
          position: relative; z-index: 1;
        }
        .ln-stats-inner {
          max-width: 1280px; margin: 0 auto; padding: 40px 64px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .ln-stat {
          padding: 0 40px 0 0;
          border-right: 1px solid rgba(255,255,255,.06);
          display: flex; flex-direction: column; gap: 5px;
        }
        .ln-stat:first-child { padding-left: 0; }
        .ln-stat:last-child { border-right: none; }
        .ln-stat-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px; font-weight: 600;
          color: var(--sprout); line-height: 1; letter-spacing: -0.02em;
        }
        .ln-stat-l {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.15em; color: rgba(255,255,255,.32);
        }

        /* ── FEATURES ── */
        .ln-features-wrap { background: var(--cream); }
        .ln-features {
          max-width: 1280px; margin: 0 auto;
          padding: 120px 64px 100px;
        }
        .ln-section-index {
          font-family: 'Cormorant Garamond', serif;
          font-size: 100px; font-weight: 300; line-height: 1;
          color: rgba(13,51,32,0.06); letter-spacing: -0.05em;
          margin-bottom: -32px; display: block;
        }
        .ln-section-eyebrow {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.28em; color: var(--leaf); margin-bottom: 18px;
          display: flex; align-items: center; gap: 12px;
        }
        .ln-section-eyebrow::before {
          content: ''; width: 32px; height: 1px; background: var(--leaf); opacity: 0.5;
        }
        .ln-features-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 5vw, 60px); font-weight: 600;
          letter-spacing: -0.03em; color: var(--ink);
          line-height: 1.05; max-width: 560px; margin-bottom: 72px;
        }
        .ln-features-h2 em { font-style: italic; color: var(--leaf); }

        .ln-features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--line);
          border: 1px solid var(--line);
        }
        .ln-feat {
          background: var(--cream); padding: 40px 36px;
          display: flex; flex-direction: column; gap: 16px;
          transition: background 0.25s;
          position: relative; overflow: hidden;
        }
        .ln-feat:hover { background: var(--parchment); }
        .ln-feat::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: var(--leaf);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s ease;
        }
        .ln-feat:hover::after { transform: scaleX(1); }
        .ln-feat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px; font-weight: 600; color: var(--leaf);
          letter-spacing: 0.1em;
        }
        .ln-feat-icon {
          font-size: 28px; line-height: 1;
        }
        .ln-feat-h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600; color: var(--ink);
          letter-spacing: -0.01em; line-height: 1.15;
        }
        .ln-feat-p {
          font-size: 13px; color: var(--warm); line-height: 1.8; flex: 1;
        }
        .ln-feat-cta {
          font-family: 'Epilogue', sans-serif;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.18em; color: var(--leaf);
          background: none; border: none; cursor: pointer; padding: 0;
          display: inline-flex; align-items: center; gap: 6px;
          transition: gap 0.2s, color 0.2s;
        }
        .ln-feat-cta:hover { gap: 10px; color: var(--ink); }

        /* ── HOW IT WORKS ── */
        .ln-how {
          background: var(--ink);
          padding: 120px 0;
          position: relative; overflow: hidden;
        }
        .ln-how::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 70% at 90% 50%, rgba(45,122,74,0.18), transparent 65%);
          pointer-events: none;
        }
        /* grain on dark section */
        .ln-how::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .ln-how-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 64px;
          position: relative; z-index: 1;
        }
        .ln-how-eyebrow {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.28em; color: var(--sprout); margin-bottom: 18px;
          display: flex; align-items: center; gap: 12px;
        }
        .ln-how-eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--sprout); opacity: 0.4; }
        .ln-how-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 5.5vw, 68px); font-weight: 300;
          color: var(--cream); letter-spacing: -0.03em;
          margin-bottom: 80px; max-width: 560px; line-height: 0.98;
        }
        .ln-how-h2 em { font-style: italic; color: var(--gold-lt); }

        .ln-steps {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0; border-top: 1px solid rgba(255,255,255,.08);
        }
        .ln-step { padding: 32px 32px 0 0; }
        .ln-step:last-child { padding-right: 0; }
        .ln-step-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px; font-weight: 300; line-height: 1;
          color: rgba(77,184,122,0.2); letter-spacing: -0.03em;
          margin-bottom: 20px; display: block;
        }
        .ln-step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600;
          color: var(--cream); letter-spacing: -0.01em;
          margin-bottom: 12px; line-height: 1.2;
        }
        .ln-step-body {
          font-size: 12.5px; color: rgba(255,255,255,.38);
          line-height: 1.75; font-weight: 300;
        }

        /* ── CTA ── */
        .ln-cta-wrap { background: var(--cream); }
        .ln-cta {
          max-width: 1280px; margin: 0 auto;
          padding: 140px 64px 160px;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .ln-cta-index {
          font-family: 'Cormorant Garamond', serif;
          font-size: 120px; font-weight: 300; line-height: 1;
          color: rgba(13,51,32,0.05); letter-spacing: -0.05em;
          margin-bottom: -44px; display: block;
          pointer-events: none;
        }
        .ln-cta-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(44px, 6.5vw, 84px); font-weight: 300;
          letter-spacing: -0.03em; color: var(--ink); line-height: 0.97;
          margin-bottom: 36px; max-width: 760px;
        }
        .ln-cta-h2 em { font-style: italic; color: var(--leaf); }
        .ln-cta-sub {
          font-size: 14px; color: var(--warm); margin-bottom: 52px;
          max-width: 480px; line-height: 1.8; font-weight: 300;
        }
        .ln-cta-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .ln-cta-primary {
          padding: 15px 36px; border-radius: 2px;
          background: var(--forest); color: var(--cream);
          font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          border: none; cursor: pointer; transition: background 0.2s, transform 0.12s;
        }
        .ln-cta-primary:hover { background: var(--canopy); }
        .ln-cta-primary:active { transform: scale(0.98); }
        .ln-cta-secondary {
          padding: 15px 32px; border-radius: 2px;
          background: transparent; color: var(--warm);
          font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          border: 1px solid var(--line); cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .ln-cta-secondary:hover { border-color: var(--forest); color: var(--forest); }

        /* ── FOOTER ── */
        .ln-footer {
          background: var(--forest);
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .ln-footer-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 32px 64px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 20px; flex-wrap: wrap;
        }
        .ln-footer-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600; color: var(--cream);
          display: flex; align-items: center; gap: 8px; letter-spacing: -0.01em;
        }
        .ln-footer-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--sprout);
        }
        .ln-footer-copy {
          font-family: 'Epilogue', sans-serif;
          font-size: 11px; color: rgba(255,255,255,.25);
          letter-spacing: 0.05em;
        }

        /* ── RESPONSIVE ── */
        @media(max-width:1024px) {
          .ln-hero-inner, .ln-stats-inner, .ln-features, .ln-how-inner, .ln-cta { padding-left: 36px; padding-right: 36px; }
        }
        @media(max-width:900px) {
          .ln-hero-inner { grid-template-columns: 1fr; gap: 0; padding-top: 80px; padding-bottom: 100px; }
          .ln-visual { display: none; }
          .ln-stats-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
          .ln-stat { border-right: none; padding-right: 0; }
          .ln-features { padding-top: 80px; }
          .ln-features-grid { grid-template-columns: 1fr; }
          .ln-steps { grid-template-columns: 1fr 1fr; gap: 40px; }
          .ln-cta { align-items: flex-start; padding-top: 100px; padding-bottom: 100px; }
          .ln-footer-inner { padding: 24px 36px; flex-direction: column; gap: 10px; text-align: center; }
        }
        @media(max-width:600px) {
          .ln-hero-inner, .ln-stats-inner, .ln-features, .ln-how-inner, .ln-cta { padding-left: 22px; padding-right: 22px; }
          .ln-h1 { font-size: 52px; }
          .ln-steps { grid-template-columns: 1fr; }
          .ln-footer-inner { padding: 20px 22px; }
        }
      `}</style>

      <Helmet>
        <title>TerraSpotter — Landing</title>
        <meta name="description" content="TerraSpotter — map land, grow forests, and track impact." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="ln-hero">
        <canvas ref={canvasRef} className="ln-canvas" />
        <div className="ln-leaf-deco" />
        <div className="ln-leaf-deco-2" />

        <div className="ln-hero-inner">
          <div>
            <motion.div {...stagger(0)}>
              <div className="ln-eyebrow"><span className="ln-eyebrow-pip" />Sustainable Infrastructure Platform</div>
            </motion.div>

            <motion.h1 className="ln-h1" {...stagger(1)}>
              Map land.<br /><em>Grow forests.</em><br />Track impact.
            </motion.h1>

            <motion.div className="ln-hero-rule" {...stagger(2)} />

            <motion.p className="ln-sub" {...stagger(2)}>
              TerraSpotter connects land, people, and intelligence to enable
              scalable, transparent afforestation — from boundary to canopy.
            </motion.p>

            <motion.div className="ln-cta-row" {...stagger(3)}>
              <button className="ln-btn-primary" onClick={() => navigate("/signup")}>Start Mapping →</button>
              <button className="ln-btn-ghost" onClick={() => navigate("/browse")}>Browse Lands</button>
            </motion.div>
          </div>

          <motion.div
            className="ln-visual"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ln-card-main">
              <div className="ln-card-label">Live land map</div>
              <div className="ln-map-mock">
                <div className="ln-map-grid" />
                <div className="ln-map-pin p1" />
                <div className="ln-map-pin p2" />
                <div className="ln-map-pin p3" />
                <div className="ln-map-pin p4" />
                <div className="ln-map-pin p5" />
              </div>
            </div>
            <div className="ln-card-row">
              <div className="ln-mini">
                <div className="ln-mini-val">2.4k</div>
                <div className="ln-mini-lbl">Lands mapped</div>
              </div>
              <div className="ln-mini">
                <div className="ln-mini-val">18k</div>
                <div className="ln-mini-lbl">Trees planted</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BELT ── */}
      <div className="ln-stats-belt">
        <div className="ln-stats-inner">
          {[
            { n: "2,400+", l: "Land parcels mapped" },
            { n: "18,000", l: "Trees planted" },
            { n: "62 t",   l: "CO₂ captured" },
            { n: "340",    l: "Active volunteers" },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="ln-stat"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.09 }}
            >
              <div className="ln-stat-n">{s.n}</div>
              <div className="ln-stat-l">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="ln-features-wrap">
        <section className="ln-features">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="ln-section-index">01</span>
            <div className="ln-section-eyebrow">What we do</div>
            <h2 className="ln-features-h2">
              Everything a plantation<br />initiative <em>actually needs</em>
            </h2>
          </motion.div>

          <div className="ln-features-grid">
            {[
              { icon: "🗺️", n: "001", title: "Verified land discovery", desc: "Identify and validate plantation-ready land using geo-tagged submissions, polygon mapping, and community review.", cta: "Browse lands", path: "/browse" },
              { icon: "🌿", n: "002", title: "AI species recommendations", desc: "Optimal tree species and planting density based on soil type, local rainfall, temperature range, and land condition.", cta: "Learn more", path: "/browse" },
              { icon: "📊", n: "003", title: "Transparent impact tracking", desc: "Track plantations over time with boundary maps, photo logs, volunteer contributions, and CO₂ estimates.", cta: "See how", path: "/browse" },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="ln-feat"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="ln-feat-num">{f.n}</div>
                <div className="ln-feat-icon">{f.icon}</div>
                <h3 className="ln-feat-h3">{f.title}</h3>
                <p className="ln-feat-p">{f.desc}</p>
                <button className="ln-feat-cta" onClick={() => navigate(f.path)}>
                  {f.cta} →
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="ln-how">
        <div className="ln-how-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="ln-how-eyebrow">Process</div>
            <h2 className="ln-how-h2">
              From empty land<br />to <em>living forest</em>
            </h2>
          </motion.div>

          <div className="ln-steps">
            {[
              { n: "01", title: "Submit land", body: "Draw the boundary on the map, upload photos, and fill in land details." },
              { n: "02", title: "Get recommendations", body: "AI fetches soil and climate data, recommends native species and planting density." },
              { n: "03", title: "Match with teams", body: "Land is matched with local volunteers, NGOs, or institutions ready to plant." },
              { n: "04", title: "Track growth", body: "Ongoing photo verification and satellite comparison track canopy growth over time." },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="ln-step"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="ln-step-n">{s.n}</span>
                <div className="ln-step-title">{s.title}</div>
                <p className="ln-step-body">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="ln-cta-wrap">
        <motion.div
          className="ln-cta"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <span className="ln-cta-index">03</span>
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
      </div>

      {/* ── FOOTER ── */}
      <footer className="ln-footer">
        <div className="ln-footer-inner">
          <div className="ln-footer-brand">
            <span className="ln-footer-dot" /> TerraSpotter
          </div>
          <span className="ln-footer-copy">Built for communities committed to sustainable afforestation.</span>
          <span className="ln-footer-copy">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  );
};

export default Landing;