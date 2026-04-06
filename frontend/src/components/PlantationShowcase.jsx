/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Showcase page displaying completed plantations and impact metrics.
 */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Calendar, TreePine, Users, MessageSquare, Camera, X, Check, ChevronLeft, ChevronRight } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─── Bone skeleton ─── */
function Bone({ style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg,#e8e2d9 25%,#d4cec5 50%,#e8e2d9 75%)",
        backgroundSize: "200% 100%",
        animation: "ps-shimmer 1.4s infinite",
        borderRadius: 4,
        ...style,
      }}
    />
  );
}

function BoneDark({ style = {} }) {
  return (
    <div
      style={{
        background: "linear-gradient(90deg,rgba(255,255,255,0.06) 25%,rgba(255,255,255,0.12) 50%,rgba(255,255,255,0.06) 75%)",
        backgroundSize: "200% 100%",
        animation: "ps-shimmer 1.4s infinite",
        borderRadius: 4,
        ...style,
      }}
    />
  );
}

/* ─── Main ─── */
export default function PlantationShowcase() {
  const [plantations, setPlantations]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedPlantation, setSelected] = useState(null);
  const [showReviewModal, setShowReview]  = useState(false);
  const [filter, setFilter]               = useState("all");

  useEffect(() => { fetchPlantations(); }, []);

  const fetchPlantations = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/api/plantations/completed`, { credentials: "include" });
      const data = await res.json();
      setPlantations(data);
    } catch (err) { console.error("Failed to fetch:", err); }
    finally { setLoading(false); }
  };

  const sorted = [...plantations].sort((a, b) => {
    if (filter === "recent")  return new Date(b.completedAt) - new Date(a.completedAt);
    if (filter === "popular") return (b.reviews?.length || 0) - (a.reviews?.length || 0);
    return 0;
  });

  const totalTrees   = plantations.reduce((s, p) => s + (p.treesPlanted || 0), 0);
  const totalReviews = plantations.reduce((s, p) => s + (p.reviews?.length || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Epilogue:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root {
          --cream:#f5f0e8; --parchment:#ede7d9; --ink:#1a1a14; --ink2:#2e2e24;
          --forest:#1c3a25; --moss:#2d5a3d; --leaf:#3d7a52; --sage:#7aad89;
          --mist:#c4d9cc; --gold:#c9a84c; --gold-lt:#e8d5a3;
          --warm:#8c8678; --line:#d6cfc4;
        }
        body{font-family:'Epilogue',sans-serif;}
        @keyframes ps-shimmer{to{background-position:-200% 0;}}
        @keyframes ps-float{
          0%,100%{transform:translate(0,0) scale(1);}
          50%{transform:translate(20px,-20px) scale(1.05);}
        }
        @keyframes ps-spin{to{transform:rotate(360deg);}}

        /* ── ROOT ── */
        .ps-root{background:var(--cream);min-height:100vh;font-family:'Epilogue',sans-serif;color:var(--ink);}

        /* ── HERO ── */
        .ps-hero{
          background:var(--forest);
          position:relative;overflow:hidden;
          padding:88px 0 72px;
        }
        .ps-hero-blob{
          position:absolute;border-radius:50%;pointer-events:none;
          filter:blur(80px);
        }
        .ps-hero-blob-1{width:480px;height:480px;top:-160px;left:-120px;background:rgba(61,122,82,0.22);animation:ps-float 22s ease-in-out infinite;}
        .ps-hero-blob-2{width:360px;height:360px;bottom:-100px;right:-80px;background:rgba(201,168,76,0.1);animation:ps-float 18s ease-in-out 6s infinite;}
        .ps-hero-inner{max-width:1340px;margin:0 auto;padding:0 56px;position:relative;z-index:1;}
        .ps-hero-eyebrow{
          font-size:10px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;
          color:var(--sage);margin-bottom:32px;display:flex;align-items:center;gap:12px;
        }
        .ps-hero-eyebrow::after{content:'';flex:0 0 40px;height:1px;background:var(--sage);opacity:0.45;}
        .ps-hero-title{
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(56px,9vw,108px);font-weight:300;line-height:0.95;
          color:var(--cream);letter-spacing:-0.03em;margin-bottom:44px;
        }
        .ps-hero-title em{font-style:italic;color:var(--gold-lt);}
        .ps-hero-rule{width:56px;height:1px;background:rgba(196,217,204,0.4);margin-bottom:52px;}
        .ps-hero-stats{display:flex;gap:0;flex-wrap:wrap;}
        .ps-stat{
          padding:0 52px 0 0;margin-right:52px;
          border-right:1px solid rgba(255,255,255,0.1);
          position:relative;
        }
        .ps-stat:last-child{border-right:none;padding-right:0;margin-right:0;}
        .ps-stat-val{
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(48px,7vw,80px);font-weight:600;line-height:1;
          color:#fff;letter-spacing:-0.03em;display:block;
        }
        .ps-stat-lbl{
          font-size:9px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;
          color:var(--sage);margin-top:7px;display:block;
        }

        /* ── STICKY NAV ── */
        .ps-nav{
          background:var(--parchment);border-bottom:1px solid var(--line);
          position:sticky;top:0;z-index:50;
        }
        .ps-nav-inner{
          max-width:1340px;margin:0 auto;padding:0 56px;
          display:flex;align-items:center;justify-content:space-between;
          height:58px;gap:24px;flex-wrap:wrap;
        }
        .ps-nav-count{
          font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--warm);
        }
        .ps-filter-row{display:flex;gap:2px;}
        .ps-fpill{
          padding:6px 20px;border-radius:100px;
          font-family:'Epilogue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.06em;
          border:1px solid transparent;cursor:pointer;transition:all 0.2s;
          background:transparent;color:var(--warm);
        }
        .ps-fpill:hover{color:var(--ink);}
        .ps-fpill.active{background:var(--forest);color:var(--cream);border-color:var(--forest);}

        /* ── CONTENT ── */
        .ps-content{max-width:1340px;margin:0 auto;padding:64px 56px 100px;}
        .ps-section-label{
          font-size:10px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;
          color:var(--warm);margin-bottom:44px;
          display:flex;align-items:center;gap:16px;
        }
        .ps-section-label::after{content:'';flex:1;height:1px;background:var(--line);}

        /* ── CARD LIST ── */
        .ps-list{display:flex;flex-direction:column;}
        .ps-card{
          display:grid;grid-template-columns:400px 1fr;
          border-top:1px solid var(--line);cursor:pointer;
          transition:background 0.2s;position:relative;
          overflow:hidden;
        }
        .ps-card:last-child{border-bottom:1px solid var(--line);}
        .ps-card:hover{background:rgba(237,231,217,0.6);}
        .ps-card:hover .ps-card-cta{opacity:1;transform:translateY(0);}
        .ps-card:hover .ps-card-img-el{transform:scale(1.05);}

        /* Image col */
        .ps-card-imgwrap{position:relative;overflow:hidden;background:var(--mist);}
        .ps-card-img-el{
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
          aspect-ratio:4/3;
        }
        .ps-card-no-img{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:8px;color:var(--warm);font-size:11px;aspect-ratio:4/3;
        }
        .ps-card-photo-badge{
          position:absolute;bottom:12px;left:12px;
          background:rgba(26,26,20,0.72);backdrop-filter:blur(6px);
          color:#fff;font-size:10px;font-weight:600;letter-spacing:0.08em;
          padding:5px 12px;border-radius:100px;
          display:flex;align-items:center;gap:5px;
        }

        /* Body col */
        .ps-card-body{
          padding:40px 52px 40px 52px;
          display:flex;flex-direction:column;
        }
        .ps-card-dateline{
          font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;
          color:var(--leaf);margin-bottom:18px;
          display:flex;align-items:center;gap:10px;
        }
        .ps-card-dateline-sep{width:3px;height:3px;border-radius:50%;background:var(--mist);}
        .ps-card-title{
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(26px,2.8vw,40px);font-weight:600;line-height:1.1;
          color:var(--ink);letter-spacing:-0.02em;margin-bottom:14px;
        }
        .ps-card-loc{
          display:flex;align-items:center;gap:6px;
          font-size:12px;color:var(--warm);margin-bottom:20px;
        }
        .ps-card-excerpt{
          font-size:13px;line-height:1.8;color:var(--warm);
          display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
          flex:1;margin-bottom:32px;
        }
        .ps-card-bottom{
          display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;
          margin-top:auto;
        }
        .ps-card-figures{display:flex;gap:32px;}
        .ps-fig-val{
          font-family:'Cormorant Garamond',serif;
          font-size:36px;font-weight:600;line-height:1;
          color:var(--ink);letter-spacing:-0.02em;display:block;
        }
        .ps-fig-lbl{
          font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;
          color:var(--warm);margin-top:4px;display:block;
        }
        .ps-card-rating{
          display:flex;align-items:center;gap:7px;
          padding:8px 18px;border:1px solid var(--line);border-radius:100px;
          font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:var(--gold);
        }
        .ps-card-cta{
          position:absolute;bottom:40px;right:52px;
          display:flex;align-items:center;gap:6px;
          padding:9px 20px;background:var(--forest);color:var(--cream);
          border-radius:2px;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;
          opacity:0;transform:translateY(6px);transition:all 0.28s;
        }

        /* ── EMPTY ── */
        .ps-empty{padding:100px 0;text-align:center;color:var(--warm);}
        .ps-empty-title{
          font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;
          color:var(--ink2);margin:18px 0 10px;
        }

        /* ── MODAL ── */
        .ps-overlay{
          position:fixed;inset:0;
          background:rgba(26,26,20,0.84);backdrop-filter:blur(14px);
          z-index:1000;display:flex;align-items:flex-start;justify-content:center;
          padding:28px 20px;overflow-y:auto;
        }
        .ps-modal{
          background:var(--cream);border-radius:2px;
          max-width:900px;width:100%;margin:auto;position:relative;overflow:hidden;
        }
        .ps-modal-x{
          position:absolute;top:18px;right:18px;
          width:38px;height:38px;border:1px solid var(--line);border-radius:50%;
          background:var(--cream);cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          z-index:10;transition:background 0.2s;color:var(--ink);
        }
        .ps-modal-x:hover{background:var(--parchment);}
        .ps-modal-gallery{position:relative;aspect-ratio:16/9;background:var(--ink);overflow:hidden;}
        .ps-modal-gallery img{width:100%;height:100%;object-fit:cover;display:block;}
        .ps-modal-nav-btn{
          position:absolute;top:50%;transform:translateY(-50%);
          width:42px;height:42px;border:1px solid rgba(255,255,255,0.25);border-radius:50%;
          background:rgba(26,26,20,0.48);backdrop-filter:blur(6px);
          color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
          transition:background 0.2s;
        }
        .ps-modal-nav-btn:hover{background:rgba(26,26,20,0.8);}
        .ps-modal-dots{
          position:absolute;bottom:14px;left:50%;transform:translateX(-50%);
          display:flex;gap:5px;
        }
        .ps-modal-dot{height:3px;border-radius:2px;background:rgba(255,255,255,0.35);cursor:pointer;transition:all 0.22s;width:18px;}
        .ps-modal-dot.on{background:#fff;width:30px;}
        .ps-modal-body{padding:48px 52px;}
        .ps-modal-ey{
          font-size:10px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;
          color:var(--leaf);margin-bottom:14px;display:flex;align-items:center;gap:10px;
        }
        .ps-modal-title{
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(30px,4.5vw,52px);font-weight:600;line-height:1.0;
          color:var(--ink);letter-spacing:-0.02em;margin-bottom:24px;
        }
        .ps-modal-metarow{
          display:flex;flex-wrap:wrap;gap:20px;
          padding:18px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);
          margin-bottom:36px;font-size:12px;color:var(--warm);
        }
        .ps-modal-metaitem{display:flex;align-items:center;gap:7px;}
        .ps-modal-stats{
          display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
          background:var(--line);border:1px solid var(--line);border-radius:2px;overflow:hidden;
          margin-bottom:36px;
        }
        .ps-modal-stat-cell{background:var(--cream);padding:22px 24px;text-align:center;}
        .ps-modal-stat-n{
          font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:600;
          line-height:1;color:var(--forest);letter-spacing:-0.02em;display:block;
        }
        .ps-modal-stat-l{
          font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;
          color:var(--warm);margin-top:6px;display:block;
        }
        .ps-modal-notes{
          background:var(--parchment);border-left:3px solid var(--forest);
          padding:20px 24px;border-radius:0 2px 2px 0;margin-bottom:36px;
          font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;
          line-height:1.7;color:var(--ink2);font-style:italic;
        }
        .ps-cta-btn{
          width:100%;padding:15px;background:var(--forest);color:var(--cream);
          border:none;border-radius:2px;font-family:'Epilogue',sans-serif;
          font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;
          transition:background 0.2s,transform 0.15s;margin-bottom:44px;
        }
        .ps-cta-btn:hover{background:var(--moss);transform:translateY(-1px);}
        .ps-reviews-sec{border-top:1px solid var(--line);padding-top:36px;}
        .ps-reviews-hd{
          font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;
          color:var(--ink);margin-bottom:20px;letter-spacing:-0.01em;
        }
        .ps-rev{padding:18px 0;border-bottom:1px solid var(--line);}
        .ps-rev:last-child{border-bottom:none;}
        .ps-rev-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;}
        .ps-rev-user{font-size:13px;font-weight:600;color:var(--ink);}
        .ps-rev-date{font-size:11px;color:var(--warm);}
        .ps-rev-stars{display:flex;gap:3px;margin-bottom:8px;}
        .ps-rev-body{font-size:13px;line-height:1.7;color:var(--ink2);}
        .ps-rev-imgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px;margin-top:10px;}
        .ps-rev-img{aspect-ratio:1;border-radius:2px;overflow:hidden;}
        .ps-rev-img img{width:100%;height:100%;object-fit:cover;}

        /* ── REVIEW MODAL ── */
        .ps-rmodal{
          background:var(--cream);border-radius:2px;
          max-width:540px;width:100%;margin:auto;position:relative;
        }
        .ps-rmodal-body{padding:48px;}
        .ps-rmodal-title{
          font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:600;
          color:var(--ink);margin-bottom:32px;letter-spacing:-0.02em;
        }
        .ps-flabel{
          display:block;font-size:9px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;
          color:var(--warm);margin-bottom:10px;
        }
        .ps-star-row{display:flex;gap:8px;margin-bottom:28px;}
        .ps-textarea{
          width:100%;min-height:112px;padding:14px 16px;
          border:1px solid var(--line);background:transparent;border-radius:2px;
          font-family:'Epilogue',sans-serif;font-size:13px;color:var(--ink);
          resize:vertical;outline:none;transition:border-color 0.2s;margin-bottom:24px;
        }
        .ps-textarea:focus{border-color:var(--forest);}
        .ps-upload{
          border:1px dashed var(--line);border-radius:2px;padding:24px;
          text-align:center;cursor:pointer;background:var(--parchment);
          transition:border-color 0.2s,background 0.2s;margin-bottom:12px;
        }
        .ps-upload:hover{border-color:var(--moss);background:#e5ede7;}
        .ps-upload-txt{font-size:11px;color:var(--warm);margin-top:7px;}
        .ps-pgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:24px;}
        .ps-pthumb{position:relative;aspect-ratio:1;border-radius:2px;overflow:hidden;}
        .ps-pthumb img{width:100%;height:100%;object-fit:cover;display:block;}
        .ps-premove{
          position:absolute;top:3px;right:3px;width:19px;height:19px;border-radius:50%;
          background:rgba(26,26,20,0.72);color:#fff;border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
        }
        .ps-err{
          padding:11px 16px;background:#fef2f2;border:1px solid #fecaca;
          border-radius:2px;font-size:12px;color:#dc2626;margin-bottom:18px;
        }
        .ps-btnrow{display:flex;gap:10px;}
        .ps-btn-ghost{
          flex:1;padding:14px;border:1px solid var(--line);background:transparent;
          border-radius:2px;font-family:'Epilogue',sans-serif;font-size:11px;font-weight:600;
          letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:var(--ink2);
          transition:border-color 0.2s;
        }
        .ps-btn-ghost:hover{border-color:var(--forest);}
        .ps-btn-solid{
          flex:1;padding:14px;border:none;background:var(--forest);border-radius:2px;
          font-family:'Epilogue',sans-serif;font-size:11px;font-weight:600;
          letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;color:var(--cream);
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background 0.2s,opacity 0.2s;
        }
        .ps-btn-solid:hover:not(:disabled){background:var(--moss);}
        .ps-btn-solid:disabled{opacity:0.55;cursor:not-allowed;}
        .ps-spin{
          width:13px;height:13px;border:2px solid rgba(245,240,232,0.3);
          border-top-color:var(--cream);border-radius:50%;
          animation:ps-spin 0.7s linear infinite;
        }

        /* ── RESPONSIVE ── */
        @media(max-width:960px){
          .ps-hero-inner,.ps-nav-inner,.ps-content{padding-left:28px;padding-right:28px;}
          .ps-card{grid-template-columns:1fr;}
          .ps-card-imgwrap .ps-card-img-el{aspect-ratio:16/9;}
          .ps-card-no-img{aspect-ratio:16/9;}
          .ps-card-body{padding:28px 28px 32px;}
          .ps-card-cta{right:28px;bottom:28px;}
        }
        @media(max-width:640px){
          .ps-hero{padding:60px 0 52px;}
          .ps-hero-stats{gap:0;flex-direction:column;}
          .ps-stat{border-right:none;border-bottom:1px solid rgba(255,255,255,0.1);padding:0 0 20px;margin:0 0 20px;}
          .ps-stat:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
          .ps-nav-inner{height:auto;padding:10px 24px;gap:8px;}
          .ps-content{padding-top:40px;padding-bottom:60px;padding-left:20px;padding-right:20px;}
          .ps-modal-body{padding:28px 24px;}
          .ps-modal-stats{grid-template-columns:repeat(3,1fr);}
          .ps-rmodal-body{padding:32px 22px;}
        }
      `}</style>

      <div className="ps-root">

        {/* ── HERO ── */}
        <div className="ps-hero">
          <div className="ps-hero-blob ps-hero-blob-1" />
          <div className="ps-hero-blob ps-hero-blob-2" />
          <div className="ps-hero-inner">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="ps-hero-eyebrow">TerraSpotter — Green Legacy Archive</div>
              <h1 className="ps-hero-title">
                Where land<br /><em>becomes forest</em>
              </h1>
              <div className="ps-hero-rule" />
            </motion.div>

            <div className="ps-hero-stats">
              {loading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="ps-stat">
                      <BoneDark style={{ height: 70, width: 120, marginBottom: 8 }} />
                      <BoneDark style={{ height: 10, width: 90 }} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { val: plantations.length,           lbl: "Plantations Completed" },
                    { val: totalTrees.toLocaleString(),  lbl: "Trees in the Ground" },
                    { val: totalReviews,                 lbl: "Community Voices" },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      className="ps-stat"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.12, duration: 0.55 }}
                    >
                      <span className="ps-stat-val">{s.val}</span>
                      <span className="ps-stat-lbl">{s.lbl}</span>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── STICKY NAV ── */}
        <div className="ps-nav">
          <div className="ps-nav-inner">
            <span className="ps-nav-count">
              {loading ? "Loading…" : `${sorted.length} Record${sorted.length !== 1 ? "s" : ""}`}
            </span>
            <div className="ps-filter-row">
              {[
                { key: "all",     label: "All" },
                { key: "recent",  label: "Recent" },
                { key: "popular", label: "Popular" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`ps-fpill${filter === key ? " active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="ps-content">
          <div className="ps-section-label">Field Reports · {new Date().getFullYear()}</div>

          {loading ? (
            <div className="ps-list">
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "400px 1fr", borderTop: "1px solid var(--line)" }}>
                  <Bone style={{ aspectRatio: "4/3", borderRadius: 0 }} />
                  <div style={{ padding: "40px 52px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <Bone style={{ height: 11, width: 100 }} />
                    <Bone style={{ height: 40, width: "75%" }} />
                    <Bone style={{ height: 40, width: "55%" }} />
                    <Bone style={{ height: 14, width: "90%" }} />
                    <Bone style={{ height: 14, width: "80%" }} />
                    <Bone style={{ height: 14, width: "70%" }} />
                    <div style={{ display: "flex", gap: 32, marginTop: "auto" }}>
                      <div>
                        <Bone style={{ height: 36, width: 72, marginBottom: 6 }} />
                        <Bone style={{ height: 10, width: 50 }} />
                      </div>
                      <div>
                        <Bone style={{ height: 36, width: 48, marginBottom: 6 }} />
                        <Bone style={{ height: 10, width: 50 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="ps-empty">
              <TreePine size={52} strokeWidth={1} />
              <div className="ps-empty-title">No records yet</div>
              <p style={{ fontSize: 13, color: "var(--warm)" }}>Be the first to complete a plantation.</p>
            </div>
          ) : (
            <motion.div
              className="ps-list"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {sorted.map((p, idx) => (
                <PlantationRow key={p.id} plantation={p} index={idx} onClick={() => setSelected(p)} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPlantation && (
          <PlantationDetailModal
            plantation={selectedPlantation}
            onClose={() => setSelected(null)}
            onReview={() => setShowReview(true)}
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <ReviewModal
            plantation={selectedPlantation}
            onClose={() => setShowReview(false)}
            onSuccess={() => { setShowReview(false); fetchPlantations(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Plantation Row ─── */
function PlantationRow({ plantation, index, onClick }) {
  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((s, r) => s + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : null;
  const imgSrc = plantation.images?.[0];

  return (
    <motion.div
      className="ps-card"
      onClick={onClick}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
    >
      {/* Image */}
      <div className="ps-card-imgwrap">
        {imgSrc ? (
          <>
            <img
              src={imgSrc}
              alt={plantation.title}
              className="ps-card-img-el"
              onError={e => { e.target.src = "https://placehold.co/400x300?text=🌿"; }}
            />
            <div className="ps-card-photo-badge">
              <Camera size={10} />
              {plantation.images?.length || 1} photo{plantation.images?.length !== 1 ? "s" : ""}
            </div>
          </>
        ) : (
          <div className="ps-card-no-img">
            <TreePine size={32} strokeWidth={1} />
            <span>No photos</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="ps-card-body">
        <div className="ps-card-dateline">
          <span>
            {new Date(plantation.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          {plantation.teamName && (
            <><span className="ps-card-dateline-sep" /><span>{plantation.teamName}</span></>
          )}
        </div>

        <h2 className="ps-card-title">{plantation.title}</h2>

        <div className="ps-card-loc">
          <MapPin size={12} strokeWidth={1.5} />
          {plantation.location}
        </div>

        {plantation.notes && (
          <p className="ps-card-excerpt">{plantation.notes}</p>
        )}

        <div className="ps-card-bottom">
          <div className="ps-card-figures">
            <div>
              <span className="ps-fig-val">{(plantation.treesPlanted || 0).toLocaleString()}</span>
              <span className="ps-fig-lbl">Trees</span>
            </div>
            <div>
              <span className="ps-fig-val">{plantation.reviews?.length || 0}</span>
              <span className="ps-fig-lbl">Reviews</span>
            </div>
          </div>
          {avgRating && (
            <div className="ps-card-rating">
              <Star size={14} fill="currentColor" strokeWidth={0} />
              {avgRating}
            </div>
          )}
        </div>

        <div className="ps-card-cta">
          View Record <ChevronRight size={13} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Detail Modal ─── */
function PlantationDetailModal({ plantation, onClose, onReview }) {
  const [cur, setCur] = useState(0);
  const images = plantation.images || [];
  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((s, r) => s + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : "—";

  return (
    <motion.div
      className="ps-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="ps-modal"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 28 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="ps-modal-x" onClick={onClose}><X size={17} /></button>

        {images.length > 0 && (
          <div className="ps-modal-gallery">
            <img src={images[cur]} alt={`img ${cur + 1}`} />
            {images.length > 1 && (
              <>
                <button className="ps-modal-nav-btn" style={{ left: 14 }} onClick={() => setCur((cur - 1 + images.length) % images.length)}>
                  <ChevronLeft size={17} />
                </button>
                <button className="ps-modal-nav-btn" style={{ right: 14 }} onClick={() => setCur((cur + 1) % images.length)}>
                  <ChevronRight size={17} />
                </button>
                <div className="ps-modal-dots">
                  {images.map((_, i) => (
                    <div key={i} className={`ps-modal-dot${i === cur ? " on" : ""}`} onClick={() => setCur(i)} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="ps-modal-body">
          <div className="ps-modal-ey">
            <span style={{ width: 24, height: 1, background: "var(--leaf)", display: "inline-block" }} />
            Field Report
          </div>
          <h2 className="ps-modal-title">{plantation.title}</h2>

          <div className="ps-modal-metarow">
            <span className="ps-modal-metaitem"><MapPin size={13} strokeWidth={1.5} />{plantation.location}</span>
            <span className="ps-modal-metaitem">
              <Calendar size={13} strokeWidth={1.5} />
              {new Date(plantation.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="ps-modal-metaitem"><Users size={13} strokeWidth={1.5} />{plantation.teamName || "Green Team"}</span>
          </div>

          <div className="ps-modal-stats">
            {[
              { val: (plantation.treesPlanted || 0).toLocaleString(), lbl: "Trees Planted" },
              { val: plantation.moreCapacity || 0,                    lbl: "More Capacity" },
              { val: avgRating,                                        lbl: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="ps-modal-stat-cell">
                <span className="ps-modal-stat-n">{s.val}</span>
                <span className="ps-modal-stat-l">{s.lbl}</span>
              </div>
            ))}
          </div>

          {plantation.notes && (
            <div className="ps-modal-notes">"{plantation.notes}"</div>
          )}

          <button className="ps-cta-btn" onClick={onReview}>
            <Star size={13} strokeWidth={1.5} /> Write a Review
          </button>

          {plantation.reviews?.length > 0 && (
            <div className="ps-reviews-sec">
              <h3 className="ps-reviews-hd">Community Reviews ({plantation.reviews.length})</h3>
              {plantation.reviews.map((r, i) => (
                <div key={i} className="ps-rev">
                  <div className="ps-rev-head">
                    <span className="ps-rev-user">{r.userName}</span>
                    <span className="ps-rev-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="ps-rev-stars">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} size={13} strokeWidth={0} fill={si < r.rating ? "var(--gold)" : "var(--line)"} />
                    ))}
                  </div>
                  <p className="ps-rev-body">{r.comment}</p>
                  {r.images?.length > 0 && (
                    <div className="ps-rev-imgs">
                      {r.images.map((img, ri) => (
                        <div key={ri} className="ps-rev-img"><img src={img} alt="" /></div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Review Modal ─── */
function ReviewModal({ plantation, onClose, onSuccess }) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState("");
  const [photos, setPhotos]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const fileRef = useRef(null);

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - photos.length);
    setPhotos(p => [...p, ...valid.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))].slice(0, 5));
  };

  const removePhoto = (idx) => {
    setPhotos(p => { URL.revokeObjectURL(p[idx].previewUrl); return p.filter((_, i) => i !== idx); });
  };

  const handleSubmit = async () => {
    if (!rating)         { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a comment"); return; }
    setError(""); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("rating", rating);
      fd.append("comment", comment);
      photos.forEach(p => fd.append("images", p.file));
      const res = await fetch(`${BASE_URL}/api/plantations/${plantation.id}/review`, { method: "POST", credentials: "include", body: fd });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.message || `Server error (${res.status})`); }
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="ps-overlay"
      style={{ zIndex: 1001 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div
        className="ps-rmodal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ps-rmodal-body">
          <button
            onClick={onClose}
            disabled={submitting}
            style={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, border: "1px solid var(--line)", borderRadius: "50%", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}
          >
            <X size={15} />
          </button>

          <h2 className="ps-rmodal-title">Leave a Review</h2>

          <label className="ps-flabel">Rating *</label>
          <div className="ps-star-row">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                size={30}
                fill={s <= (hovered || rating) ? "var(--gold)" : "none"}
                strokeWidth={1.5}
                style={{ cursor: "pointer", color: "var(--gold)", transition: "transform 0.15s" }}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
              />
            ))}
          </div>

          <label className="ps-flabel">Your Review *</label>
          <textarea
            className="ps-textarea"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Describe what you observed — the growth, the terrain, the atmosphere…"
          />

          <label className="ps-flabel">Add Photos (Optional)</label>
          {photos.length < 5 && (
            <div className="ps-upload" onClick={() => fileRef.current?.click()}>
              <Camera size={22} style={{ margin: "0 auto", color: "var(--warm)" }} />
              <div className="ps-upload-txt">Click to upload</div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
            </div>
          )}
          {photos.length > 0 && (
            <div className="ps-pgrid">
              {photos.map((p, i) => (
                <div key={i} className="ps-pthumb">
                  <img src={p.previewUrl} alt="" />
                  <button className="ps-premove" onClick={() => removePhoto(i)}><X size={10} /></button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="ps-err">{error}</div>}

          <div className="ps-btnrow">
            <button className="ps-btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="ps-btn-solid" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><div className="ps-spin" />Submitting…</>
                : <><Check size={14} />Submit Review</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}