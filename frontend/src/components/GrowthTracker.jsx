/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Per-site growth timeline page with update submission modal.
*/
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine, TrendingUp, Heart, Camera, X, ChevronLeft, ChevronRight,
  Plus, Sprout, Droplets, Sun, AlertTriangle, ArrowLeft
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─── Health config ─── */
const HEALTH_OPTIONS = [
  { key: "Thriving",   icon: <Sun size={14} />,            color: "#16a34a", bg: "rgba(22,163,74,0.10)", label: "Thriving" },
  { key: "Healthy",    icon: <Sprout size={14} />,          color: "#65a30d", bg: "rgba(101,163,13,0.10)", label: "Healthy" },
  { key: "Struggling", icon: <Droplets size={14} />,        color: "#d97706", bg: "rgba(217,119,6,0.10)", label: "Struggling" },
  { key: "Critical",   icon: <AlertTriangle size={14} />,   color: "#dc2626", bg: "rgba(220,38,38,0.10)", label: "Critical" },
];

function getHealthConfig(status) {
  return HEALTH_OPTIONS.find(h => h.key === status) || HEALTH_OPTIONS[1];
}

/* ─── Skeleton ─── */
function Bone({ style = {} }) {
  return (
    <div style={{
      background: "linear-gradient(90deg,#e8e2d9 25%,#d4cec5 50%,#e8e2d9 75%)",
      backgroundSize: "200% 100%", animation: "gt-shimmer 1.4s infinite",
      borderRadius: 4, ...style,
    }} />
  );
}

/* ─── Main Component ─── */
export default function GrowthTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [updates, setUpdates]     = useState([]);
  const [landInfo, setLandInfo]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedImg, setExpandedImg] = useState(null);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [updRes, landRes] = await Promise.all([
        fetch(`${BASE_URL}/api/lands/${id}/growth-updates`, { credentials: "include" }),
        fetch(`${BASE_URL}/api/lands/${id}`, { credentials: "include" }),
      ]);
      const updData = await updRes.json();
      const landData = await landRes.json();
      setUpdates(updData);
      setLandInfo(landData);
    } catch (err) { console.error("Failed to fetch growth data:", err); }
    finally { setLoading(false); }
  };

  const latestHealth = updates.length > 0 ? updates[0].healthStatus : null;
  const latestSurvival = updates.length > 0 ? updates[0].survivalRate : null;
  const hConf = getHealthConfig(latestHealth);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400\u0026family=Epilogue:wght@300;400;500;600;700\u0026display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root {
          --gt-cream:#f5f0e8; --gt-parchment:#ede7d9; --gt-ink:#1a1a14; --gt-ink2:#2e2e24;
          --gt-forest:#1c3a25; --gt-moss:#2d5a3d; --gt-leaf:#3d7a52; --gt-sage:#7aad89;
          --gt-mist:#c4d9cc; --gt-gold:#c9a84c; --gt-gold-lt:#e8d5a3;
          --gt-warm:#8c8678; --gt-line:#d6cfc4;
        }
        @keyframes gt-shimmer{to{background-position:-200% 0;}}
        @keyframes gt-pulse{0%,100%{opacity:1;}50%{opacity:.55;}}
        @keyframes gt-float{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(20px,-20px) scale(1.05);}}

        .gt-root{background:var(--gt-cream);min-height:100vh;font-family:'Epilogue',sans-serif;color:var(--gt-ink);}

        /* ── HERO ── */
        .gt-hero{background:var(--gt-forest);position:relative;overflow:hidden;padding:80px 0 64px;}
        .gt-hero-blob{position:absolute;border-radius:50%;pointer-events:none;filter:blur(80px);}
        .gt-blob-1{width:440px;height:440px;top:-140px;left:-100px;background:rgba(61,122,82,0.22);animation:gt-float 20s ease-in-out infinite;}
        .gt-blob-2{width:320px;height:320px;bottom:-80px;right:-60px;background:rgba(201,168,76,0.1);animation:gt-float 16s ease-in-out 5s infinite;}
        .gt-hero-inner{max-width:1200px;margin:0 auto;padding:0 48px;position:relative;z-index:1;}
        .gt-back{
          display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;
          color:var(--gt-sage);text-decoration:none;margin-bottom:24px;cursor:pointer;
          border:none;background:none;transition:color .15s;
        }
        .gt-back:hover{color:#fff;}
        .gt-hero-eyebrow{
          font-size:10px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;
          color:var(--gt-sage);margin-bottom:20px;display:flex;align-items:center;gap:12px;
        }
        .gt-hero-eyebrow::after{content:'';flex:0 0 40px;height:1px;background:var(--gt-sage);opacity:.45;}
        .gt-hero-title{
          font-family:'Cormorant Garamond',serif;font-size:clamp(40px,6vw,72px);
          font-weight:300;line-height:.95;color:var(--gt-cream);letter-spacing:-.03em;margin-bottom:12px;
        }
        .gt-hero-title em{font-style:italic;color:var(--gt-gold-lt);}
        .gt-hero-subtitle{font-size:14px;color:var(--gt-sage);margin-bottom:36px;max-width:500px;line-height:1.6;}
        .gt-hero-stats{display:flex;gap:0;flex-wrap:wrap;}
        .gt-hstat{
          padding:0 44px 0 0;margin-right:44px;border-right:1px solid rgba(255,255,255,.1);
        }
        .gt-hstat:last-child{border-right:none;padding-right:0;margin-right:0;}
        .gt-hstat-val{
          font-family:'Cormorant Garamond',serif;font-size:clamp(36px,5vw,56px);
          font-weight:600;line-height:1;color:#fff;letter-spacing:-.03em;display:block;
        }
        .gt-hstat-lbl{
          font-size:9px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;
          color:var(--gt-sage);margin-top:6px;display:block;
        }

        /* ── HEALTH BADGE ── */
        .gt-health-badge{
          display:inline-flex;align-items:center;gap:6px;
          padding:5px 14px;border-radius:100px;font-size:11px;font-weight:600;
          letter-spacing:.06em;
        }

        /* ── ACTION BAR ── */
        .gt-action{
          background:var(--gt-parchment);border-bottom:1px solid var(--gt-line);
          position:sticky;top:0;z-index:50;
        }
        .gt-action-inner{
          max-width:1200px;margin:0 auto;padding:0 48px;height:60px;
          display:flex;align-items:center;justify-content:space-between;
        }
        .gt-action-left{font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--gt-warm);}
        .gt-add-btn{
          display:flex;align-items:center;gap:7px;padding:9px 20px;border-radius:100px;
          border:none;background:var(--gt-forest);color:var(--gt-cream);
          font-family:'Epilogue',sans-serif;font-size:12px;font-weight:600;letter-spacing:.06em;
          cursor:pointer;transition:background .2s,transform .1s;
        }
        .gt-add-btn:hover{background:var(--gt-moss);transform:translateY(-1px);}

        /* ── TIMELINE ── */
        .gt-timeline{max-width:1200px;margin:0 auto;padding:56px 48px 100px;}
        .gt-timeline-line{
          position:relative;
          padding-left:48px;
        }
        .gt-timeline-line::before{
          content:'';position:absolute;left:14px;top:0;bottom:0;width:2px;
          background:linear-gradient(to bottom,var(--gt-forest),var(--gt-mist));
          border-radius:2px;
        }

        /* ── TIMELINE CARD ── */
        .gt-tcard{
          position:relative;margin-bottom:40px;
          background:#fff;border:1px solid var(--gt-line);border-radius:16px;
          overflow:hidden;transition:box-shadow .25s,transform .25s;
        }
        .gt-tcard:hover{box-shadow:0 8px 40px rgba(0,0,0,.08);transform:translateY(-2px);}
        .gt-tcard-dot{
          position:absolute;left:-42px;top:28px;width:12px;height:12px;
          border-radius:50%;border:2.5px solid var(--gt-forest);background:var(--gt-cream);
          z-index:1;
        }
        .gt-tcard-header{
          padding:22px 28px 16px;display:flex;align-items:flex-start;justify-content:space-between;
          flex-wrap:wrap;gap:10px;
        }
        .gt-tcard-date{font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--gt-leaf);}
        .gt-tcard-user{font-size:12px;color:var(--gt-warm);display:flex;align-items:center;gap:5px;}

        /* metrics row */
        .gt-metrics{
          display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--gt-line);
          margin:0 28px;border-radius:10px;overflow:hidden;
        }
        .gt-metric{background:var(--gt-cream);padding:16px 18px;text-align:center;}
        .gt-metric-val{
          font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;
          line-height:1;color:var(--gt-forest);display:block;
        }
        .gt-metric-lbl{font-size:9px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--gt-warm);margin-top:4px;display:block;}

        /* notes */
        .gt-tcard-notes{
          padding:18px 28px;font-size:13px;line-height:1.7;color:var(--gt-ink2);
          border-top:1px solid var(--gt-line);
        }

        /* images */
        .gt-tcard-imgs{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));
          gap:6px;padding:0 28px 22px;
        }
        .gt-tcard-img{
          aspect-ratio:1;border-radius:8px;overflow:hidden;cursor:pointer;
          border:1px solid var(--gt-line);transition:transform .2s;
        }
        .gt-tcard-img:hover{transform:scale(1.04);}
        .gt-tcard-img img{width:100%;height:100%;object-fit:cover;display:block;}

        /* ── GROWTH CHART ── */
        .gt-chart-sec{
          max-width:1200px;margin:0 auto;padding:0 48px 56px;
        }
        .gt-chart-label{
          font-size:10px;font-weight:600;letter-spacing:.25em;text-transform:uppercase;
          color:var(--gt-warm);margin-bottom:24px;display:flex;align-items:center;gap:16px;
        }
        .gt-chart-label::after{content:'';flex:1;height:1px;background:var(--gt-line);}
        .gt-chart-wrap{
          background:#fff;border:1px solid var(--gt-line);border-radius:16px;
          padding:32px;overflow:hidden;
        }
        .gt-chart-svg{width:100%;height:200px;}
        .gt-chart-legend{
          display:flex;gap:24px;margin-top:16px;justify-content:center;
        }
        .gt-chart-legend-item{
          display:flex;align-items:center;gap:6px;font-size:11px;color:var(--gt-warm);font-weight:500;
        }
        .gt-chart-legend-dot{width:10px;height:10px;border-radius:50%;}

        /* ── EMPTY ── */
        .gt-empty{
          text-align:center;padding:80px 24px;
        }
        .gt-empty-title{
          font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;
          color:var(--gt-ink2);margin:16px 0 8px;
        }
        .gt-empty p{font-size:13px;color:var(--gt-warm);margin-bottom:24px;}

        /* ── IMAGE LIGHTBOX ── */
        .gt-lightbox{
          position:fixed;inset:0;background:rgba(26,26,20,.92);backdrop-filter:blur(12px);
          z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;
        }
        .gt-lightbox img{max-width:90%;max-height:90vh;border-radius:4px;object-fit:contain;}
        .gt-lightbox-close{
          position:absolute;top:20px;right:20px;width:40px;height:40px;border-radius:50%;
          background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);
          color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
          transition:background .15s;
        }
        .gt-lightbox-close:hover{background:rgba(255,255,255,.25);}

        /* ── MODAL ── */
        .gt-overlay{
          position:fixed;inset:0;background:rgba(8,24,15,.58);z-index:10001;
          display:flex;align-items:center;justify-content:center;padding:20px;
          backdrop-filter:blur(6px);overflow-y:auto;
        }
        .gt-modal{
          background:var(--gt-cream);border-radius:22px;width:100%;max-width:560px;
          box-shadow:0 28px 90px rgba(13,51,32,.26);overflow:hidden;margin:auto;
        }
        .gt-modal-header{
          background:linear-gradient(135deg,#0d3320 0%,#2d8a55 100%);
          padding:28px 32px 22px;position:relative;
        }
        .gt-modal-badge{
          display:inline-flex;align-items:center;gap:6px;
          background:rgba(255,255,255,.15);border-radius:20px;
          padding:4px 12px;font-size:11.5px;color:rgba(255,255,255,.85);
          font-weight:600;letter-spacing:.4px;text-transform:uppercase;margin-bottom:10px;
        }
        .gt-modal-header h2{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#fff;letter-spacing:-.3px;}
        .gt-modal-header p{font-size:13px;color:rgba(255,255,255,.62);margin-top:4px;}
        .gt-modal-close{
          position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;
          background:rgba(255,255,255,.12);border:none;color:white;font-size:16px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;transition:background .15s;
        }
        .gt-modal-close:hover{background:rgba(255,255,255,.22);}
        .gt-modal-body{padding:26px 32px 22px;display:flex;flex-direction:column;gap:18px;}

        /* form fields */
        .gt-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .gt-field{display:flex;flex-direction:column;gap:6px;}
        .gt-field.full{grid-column:1/-1;}
        .gt-flabel{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#4a5e52;}
        .gt-req{color:#c0392b;margin-left:2px;}
        .gt-finput,.gt-ftextarea{
          padding:10px 14px;border:1.5px solid #dde5e0;border-radius:9px;
          font-family:'Epilogue',sans-serif;font-size:14px;background:#fff;color:#0f1a14;
          outline:none;transition:border-color .2s,box-shadow .2s;width:100%;
        }
        .gt-finput:focus,.gt-ftextarea:focus{border-color:#2d8a55;box-shadow:0 0 0 3px rgba(45,138,85,.1);}
        .gt-ftextarea{resize:none;min-height:72px;line-height:1.5;}
        .gt-fhint{font-size:11.5px;color:#6b7a72;margin-top:2px;}

        /* health selector */
        .gt-health-sel{display:flex;gap:8px;flex-wrap:wrap;}
        .gt-health-opt{
          display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:100px;
          border:1.5px solid #dde5e0;background:#fff;cursor:pointer;
          font-family:'Epilogue',sans-serif;font-size:12px;font-weight:500;color:#4a5e52;
          transition:all .2s;
        }
        .gt-health-opt:hover{border-color:#2d8a55;}
        .gt-health-opt.sel{border-color:currentColor;font-weight:600;}

        /* slider */
        .gt-slider-wrap{display:flex;align-items:center;gap:12px;}
        .gt-slider{
          flex:1;-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;
          background:linear-gradient(to right,#dc2626,#d97706 40%,#65a30d 70%,#16a34a);
          outline:none;
        }
        .gt-slider::-webkit-slider-thumb{
          -webkit-appearance:none;width:20px;height:20px;border-radius:50%;
          background:#fff;border:2px solid var(--gt-forest);cursor:pointer;
          box-shadow:0 2px 6px rgba(0,0,0,.15);
        }
        .gt-slider-val{
          font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;
          color:var(--gt-forest);min-width:48px;text-align:center;
        }

        /* photo upload */
        .gt-drop{
          border:2px dashed #c5d5cc;border-radius:12px;padding:22px;
          text-align:center;cursor:pointer;transition:border-color .2s,background .2s;
          background:#f5f1eb;
        }
        .gt-drop.over{border-color:#2d8a55;background:#e8f5ee;}
        .gt-drop-icon{font-size:28px;margin-bottom:6px;}
        .gt-drop-text{font-size:13.5px;color:#4a5e52;font-weight:500;}
        .gt-drop-sub{font-size:12px;color:#8a9e92;margin-top:3px;}
        .gt-photos{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px;}
        .gt-photo-thumb{
          aspect-ratio:1;border-radius:9px;overflow:hidden;position:relative;
          border:1.5px solid #dde5e0;
        }
        .gt-photo-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
        .gt-photo-remove{
          position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;
          background:rgba(0,0,0,.65);color:white;border:none;cursor:pointer;
          font-size:11px;display:flex;align-items:center;justify-content:center;
        }

        .gt-error{
          padding:9px 14px;background:#fff5f5;border:1px solid #fecaca;
          border-radius:8px;font-size:12.5px;color:#c0392b;display:flex;align-items:center;gap:7px;
        }
        .gt-modal-footer{
          padding:14px 32px 24px;display:flex;gap:10px;justify-content:flex-end;
          border-top:1px solid #e8ede9;
        }
        .gt-btn-cancel{
          padding:10px 20px;border-radius:9px;border:1.5px solid #dde5e0;
          background:#fff;color:#6b7a72;font-family:'Epilogue',sans-serif;
          font-size:14px;cursor:pointer;transition:border-color .15s;
        }
        .gt-btn-cancel:hover{border-color:#0d3320;color:#0d3320;}
        .gt-btn-submit{
          padding:10px 24px;border-radius:9px;border:none;
          background:linear-gradient(135deg,#16a34a,#0d3320);color:#fff;
          font-family:'Epilogue',sans-serif;font-size:14px;font-weight:600;
          cursor:pointer;display:flex;align-items:center;gap:8px;
          transition:opacity .15s,transform .1s;
        }
        .gt-btn-submit:hover:not(:disabled){opacity:.9;}
        .gt-btn-submit:active:not(:disabled){transform:scale(.98);}
        .gt-btn-submit:disabled{opacity:.45;cursor:not-allowed;}
        .gt-spin{
          width:13px;height:13px;border:2px solid rgba(255,255,255,.35);
          border-top-color:#fff;border-radius:50%;animation:gt-spin .6s linear infinite;
        }
        @keyframes gt-spin{to{transform:rotate(360deg)}}

        @media(max-width:768px){
          .gt-hero-inner,.gt-action-inner,.gt-timeline,.gt-chart-sec{padding-left:20px;padding-right:20px;}
          .gt-hero{padding:60px 0 48px;}
          .gt-hero-stats{flex-direction:column;gap:0;}
          .gt-hstat{border-right:none;border-bottom:1px solid rgba(255,255,255,.1);padding:0 0 16px;margin:0 0 16px;}
          .gt-hstat:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
          .gt-timeline-line{padding-left:32px;}
          .gt-timeline-line::before{left:8px;}
          .gt-tcard-dot{left:-28px;}
          .gt-metrics{grid-template-columns:1fr;}
          .gt-fgrid{grid-template-columns:1fr;}
          .gt-modal-body{padding:20px 18px;}
          .gt-modal-footer{padding:12px 18px 20px;}
          .gt-modal-header{padding:22px 18px 18px;}
        }
      `}</style>

      <div className="gt-root">

        {/* ── HERO ── */}
        <div className="gt-hero">
          <div className="gt-hero-blob gt-blob-1" />
          <div className="gt-hero-blob gt-blob-2" />
          <div className="gt-hero-inner">
            <button className="gt-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back to site
            </button>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="gt-hero-eyebrow">Community Growth Tracker</div>
              <h1 className="gt-hero-title">
                {loading ? <Bone style={{ height: 60, width: "70%", background: "rgba(255,255,255,.08)" }} />
                  : <>{landInfo?.title || "Plantation Site"} — <em>Growth Journal</em></>}
              </h1>
              {landInfo?.nearbyLandmark && (
                <p className="gt-hero-subtitle">📍 {landInfo.nearbyLandmark} · {landInfo.district || ""}</p>
              )}
            </motion.div>

            <div className="gt-hero-stats">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="gt-hstat">
                    <Bone style={{ height: 48, width: 90, background: "rgba(255,255,255,.06)", marginBottom: 6 }} />
                    <Bone style={{ height: 10, width: 70, background: "rgba(255,255,255,.06)" }} />
                  </div>
                ))
              ) : (
                <>
                  <motion.div className="gt-hstat" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
                    <span className="gt-hstat-val">{updates.length}</span>
                    <span className="gt-hstat-lbl">Updates</span>
                  </motion.div>
                  <motion.div className="gt-hstat" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
                    <span className="gt-hstat-val">{landInfo?.totalTreesPlanted || 0}</span>
                    <span className="gt-hstat-lbl">Trees Planted</span>
                  </motion.div>
                  <motion.div className="gt-hstat" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}>
                    <span className="gt-hstat-val">{latestSurvival != null ? `${latestSurvival}%` : "—"}</span>
                    <span className="gt-hstat-lbl">Survival Rate</span>
                  </motion.div>
                  <motion.div className="gt-hstat" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }}>
                    {latestHealth ? (
                      <div className="gt-health-badge" style={{ background: hConf.bg, color: hConf.color, marginTop: 6 }}>
                        {hConf.icon} {hConf.label}
                      </div>
                    ) : (
                      <span className="gt-hstat-val">—</span>
                    )}
                    <span className="gt-hstat-lbl">Latest Health</span>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── ACTION BAR ── */}
        <div className="gt-action">
          <div className="gt-action-inner">
            <span className="gt-action-left">
              {loading ? "Loading…" : `${updates.length} Growth Update${updates.length !== 1 ? "s" : ""}`}
            </span>
            <button className="gt-add-btn" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Submit Update
            </button>
          </div>
        </div>

        {/* ── GROWTH CHART ── */}
        {!loading && updates.length >= 2 && (
          <div className="gt-chart-sec" style={{ paddingTop: 56 }}>
            <div className="gt-chart-label">Growth Progression</div>
            <div className="gt-chart-wrap">
              <GrowthChart updates={[...updates].reverse()} />
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        <div className="gt-timeline">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid var(--gt-line)", borderRadius: 16, padding: 28 }}>
                  <Bone style={{ height: 12, width: 120, marginBottom: 16 }} />
                  <Bone style={{ height: 80, width: "100%", marginBottom: 12 }} />
                  <Bone style={{ height: 14, width: "60%" }} />
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="gt-empty">
              <Sprout size={52} strokeWidth={1} color="var(--gt-warm)" />
              <div className="gt-empty-title">No growth updates yet</div>
              <p>Be the first to document how this plantation is growing!</p>
              <button className="gt-add-btn" onClick={() => setShowModal(true)}>
                <Plus size={14} /> Submit First Update
              </button>
            </div>
          ) : (
            <motion.div
              className="gt-timeline-line"
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: .08 } } }}
            >
              {updates.map((u, idx) => (
                <TimelineCard key={u.id || idx} update={u} onImageClick={setExpandedImg} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── SUBMIT MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <UpdateModal
            landId={id}
            landTitle={landInfo?.title}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {expandedImg && (
          <motion.div className="gt-lightbox"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setExpandedImg(null)}
          >
            <button className="gt-lightbox-close" onClick={() => setExpandedImg(null)}><X size={18} /></button>
            <motion.img src={expandedImg} alt="" initial={{ scale: .9 }} animate={{ scale: 1 }} exit={{ scale: .9 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Timeline Card ─── */
function TimelineCard({ update, onImageClick }) {
  const hConf = getHealthConfig(update.healthStatus);
  const images = update.images?.map(img => typeof img === "string" ? img : img.imageUrl) || [];

  return (
    <motion.div
      className="gt-tcard"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: .45 } } }}
    >
      <div className="gt-tcard-dot" />

      <div className="gt-tcard-header">
        <div>
          <div className="gt-tcard-date">
            {new Date(update.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="gt-tcard-user">👤 {update.userName || "Community member"}</div>
        </div>
        <div className="gt-health-badge" style={{ background: hConf.bg, color: hConf.color }}>
          {hConf.icon} {hConf.label}
        </div>
      </div>

      <div className="gt-metrics">
        <div className="gt-metric">
          <span className="gt-metric-val">{update.averageHeightCm || "—"}</span>
          <span className="gt-metric-lbl">Height (cm)</span>
        </div>
        <div className="gt-metric">
          <span className="gt-metric-val">{update.survivalRate != null ? `${update.survivalRate}%` : "—"}</span>
          <span className="gt-metric-lbl">Survival</span>
        </div>
        <div className="gt-metric">
          <span className="gt-metric-val" style={{ color: hConf.color }}>{hConf.label}</span>
          <span className="gt-metric-lbl">Health</span>
        </div>
      </div>

      {update.notes && <div className="gt-tcard-notes">{update.notes}</div>}

      {images.length > 0 && (
        <div className="gt-tcard-imgs" style={{ paddingTop: update.notes ? 0 : 18 }}>
          {images.map((img, i) => (
            <div key={i} className="gt-tcard-img" onClick={() => onImageClick(img)}>
              <img src={img} alt={`Growth photo ${i + 1}`} />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Growth Chart (SVG) ─── */
function GrowthChart({ updates }) {
  if (!updates || updates.length < 2) return null;

  const W = 800, H = 180, PAD = 40;
  const heightData = updates.map(u => u.averageHeightCm || 0);
  const survivalData = updates.map(u => u.survivalRate || 0);
  const maxH = Math.max(...heightData, 10);
  const points = (data, maxVal) =>
    data.map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((v / maxVal) * (H - PAD * 2));
      return `${x},${y}`;
    }).join(" ");

  return (
    <>
      <svg className="gt-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, .25, .5, .75, 1].map(p => (
          <line key={p}
            x1={PAD} x2={W - PAD}
            y1={H - PAD - p * (H - PAD * 2)} y2={H - PAD - p * (H - PAD * 2)}
            stroke="var(--gt-line)" strokeWidth="1" strokeDasharray="4,4" />
        ))}

        {/* Height line */}
        <polyline
          points={points(heightData, maxH)}
          fill="none" stroke="var(--gt-forest)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        />
        {/* Height dots */}
        {heightData.map((v, i) => {
          const x = PAD + (i / (heightData.length - 1)) * (W - PAD * 2);
          const y = H - PAD - ((v / maxH) * (H - PAD * 2));
          return <circle key={`h-${i}`} cx={x} cy={y} r="4" fill="var(--gt-forest)" stroke="#fff" strokeWidth="2" />;
        })}

        {/* Survival line */}
        <polyline
          points={points(survivalData, 100)}
          fill="none" stroke="var(--gt-gold)" strokeWidth="2" strokeDasharray="6,3" strokeLinejoin="round" strokeLinecap="round"
        />
        {survivalData.map((v, i) => {
          const x = PAD + (i / (survivalData.length - 1)) * (W - PAD * 2);
          const y = H - PAD - ((v / 100) * (H - PAD * 2));
          return <circle key={`s-${i}`} cx={x} cy={y} r="3.5" fill="var(--gt-gold)" stroke="#fff" strokeWidth="2" />;
        })}

        {/* Labels */}
        {updates.map((u, i) => {
          const x = PAD + (i / (updates.length - 1)) * (W - PAD * 2);
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--gt-warm)" fontFamily="'Epilogue',sans-serif">
              {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </text>
          );
        })}
      </svg>
      <div className="gt-chart-legend">
        <div className="gt-chart-legend-item">
          <div className="gt-chart-legend-dot" style={{ background: "var(--gt-forest)" }} />
          Avg Height (cm) — max {maxH}
        </div>
        <div className="gt-chart-legend-item">
          <div className="gt-chart-legend-dot" style={{ background: "var(--gt-gold)" }} />
          Survival Rate (%)
        </div>
      </div>
    </>
  );
}

/* ─── Submit Update Modal ─── */
function UpdateModal({ landId, landTitle, onClose, onSuccess }) {
  const [form, setForm] = useState({ averageHeightCm: "", survivalRate: 75, healthStatus: "Healthy", notes: "" });
  const [photos, setPhotos] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFiles = files => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - photos.length);
    const entries = valid.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos(prev => [...prev, ...entries].slice(0, 5));
  };
  const removePhoto = idx => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if (!form.averageHeightCm) { setError("Please enter approximate tree height."); return; }
    if (!form.healthStatus) { setError("Please select a health status."); return; }
    setError(""); setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("averageHeightCm", form.averageHeightCm);
      fd.append("survivalRate", form.survivalRate);
      fd.append("healthStatus", form.healthStatus);
      if (form.notes) fd.append("notes", form.notes);
      photos.forEach(p => fd.append("images", p.file));

      const res = await fetch(`${BASE_URL}/api/lands/${landId}/growth-updates`, {
        method: "POST", credentials: "include", body: fd,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || `Server error (${res.status})`);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="gt-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && !submitting && onClose()}
    >
      <motion.div className="gt-modal"
        initial={{ scale: .93, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .93, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <div className="gt-modal-header">
          <button className="gt-modal-close" onClick={onClose} disabled={submitting}>✕</button>
          <div className="gt-modal-badge">🌱 Growth Update</div>
          <h2>Submit Growth Update</h2>
          <p>{landTitle || "Plantation Site"} — document the current state</p>
        </div>

        <div className="gt-modal-body">

          {/* Health Status */}
          <div className="gt-field full">
            <label className="gt-flabel">Health Status <span className="gt-req">*</span></label>
            <div className="gt-health-sel">
              {HEALTH_OPTIONS.map(h => (
                <button
                  key={h.key}
                  className={`gt-health-opt${form.healthStatus === h.key ? " sel" : ""}`}
                  style={form.healthStatus === h.key ? { borderColor: h.color, color: h.color, background: h.bg } : {}}
                  onClick={() => set("healthStatus", h.key)}
                  type="button"
                >
                  {h.icon} {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Numbers */}
          <div className="gt-fgrid">
            <div className="gt-field">
              <label className="gt-flabel">Avg Height (cm) <span className="gt-req">*</span></label>
              <input type="number" className="gt-finput" placeholder="e.g. 45"
                min="1" value={form.averageHeightCm} onChange={e => set("averageHeightCm", e.target.value)} />
              <span className="gt-fhint">Approximate average height</span>
            </div>
            <div className="gt-field">
              <label className="gt-flabel">Survival Rate</label>
              <div className="gt-slider-wrap">
                <input type="range" className="gt-slider" min="0" max="100"
                  value={form.survivalRate} onChange={e => set("survivalRate", parseInt(e.target.value))} />
                <span className="gt-slider-val">{form.survivalRate}%</span>
              </div>
              <span className="gt-fhint">% of trees that survived</span>
            </div>
          </div>

          {/* Notes */}
          <div className="gt-field full">
            <label className="gt-flabel">Field Notes</label>
            <textarea className="gt-ftextarea"
              placeholder="e.g. New shoots visible on most trees. Some insect damage on the eastern perimeter. Soil moisture looks good after recent rain…"
              value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>

          {/* Photo uploader */}
          <div>
            <label className="gt-flabel" style={{ display: "block", marginBottom: 8 }}>
              Photos
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#6b7a72", marginLeft: 6 }}>
                (up to 5 images)
              </span>
            </label>
            {photos.length < 5 && (
              <div
                className={`gt-drop${dragOver ? " over" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              >
                <div className="gt-drop-icon">📸</div>
                <div className="gt-drop-text">Click or drag photos here</div>
                <div className="gt-drop-sub">JPG, PNG, WEBP — show the plantation growth</div>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
              </div>
            )}
            {photos.length > 0 && (
              <div className="gt-photos">
                {photos.map((p, i) => (
                  <div key={i} className="gt-photo-thumb">
                    <img src={p.previewUrl} alt="" />
                    <button className="gt-photo-remove" onClick={() => removePhoto(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="gt-error">⚠️ {error}</div>}
        </div>

        <div className="gt-modal-footer">
          <button className="gt-btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="gt-btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><div className="gt-spin" /> Uploading…</> : "🌱 Submit Update"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
