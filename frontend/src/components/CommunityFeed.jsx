/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Global community feed showing recent growth updates across all plantation sites.
*/
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine, TrendingUp, Heart, Sprout, Droplets, Sun, AlertTriangle,
  MapPin, Clock, ChevronRight, Users, BarChart3, Activity
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─── Health helpers ─── */
const HEALTH_MAP = {
  Thriving:   { icon: <Sun size={12} />,            color: "#16a34a", bg: "rgba(22,163,74,0.10)" },
  Healthy:    { icon: <Sprout size={12} />,          color: "#65a30d", bg: "rgba(101,163,13,0.10)" },
  Struggling: { icon: <Droplets size={12} />,        color: "#d97706", bg: "rgba(217,119,6,0.10)" },
  Critical:   { icon: <AlertTriangle size={12} />,   color: "#dc2626", bg: "rgba(220,38,38,0.10)" },
};
function getHealth(s) { return HEALTH_MAP[s] || HEALTH_MAP.Healthy; }

/* ─── Time-ago ─── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Skeleton ─── */
function Bone({ style = {} }) {
  return (
    <div style={{
      background: "linear-gradient(90deg,#e8e2d9 25%,#d4cec5 50%,#e8e2d9 75%)",
      backgroundSize: "200% 100%", animation: "cf-shimmer 1.4s infinite",
      borderRadius: 4, ...style,
    }} />
  );
}
function BoneDark({ style = {} }) {
  return (
    <div style={{
      background: "linear-gradient(90deg,rgba(255,255,255,0.06) 25%,rgba(255,255,255,0.12) 50%,rgba(255,255,255,0.06) 75%)",
      backgroundSize: "200% 100%", animation: "cf-shimmer 1.4s infinite",
      borderRadius: 4, ...style,
    }} />
  );
}

/* ─── Main ─── */
export default function CommunityFeed() {
  const navigate = useNavigate();
  const [feed, setFeed]       = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [feedRes, statsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/growth/feed`, { credentials: "include" }),
        fetch(`${BASE_URL}/api/growth/stats`, { credentials: "include" }),
      ]);
      setFeed(await feedRes.json());
      setStats(await statsRes.json());
    } catch (err) { console.error("Failed to fetch community feed:", err); }
    finally { setLoading(false); }
  };

  const filtered = feed.filter(u => {
    if (filter === "attention") return u.healthStatus === "Struggling" || u.healthStatus === "Critical";
    return true;
  }).sort((a, b) => {
    if (filter === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400\u0026family=Epilogue:wght@300;400;500;600;700\u0026display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root {
          --cf-cream:#f5f0e8; --cf-parchment:#ede7d9; --cf-ink:#1a1a14; --cf-ink2:#2e2e24;
          --cf-forest:#1c3a25; --cf-moss:#2d5a3d; --cf-leaf:#3d7a52; --cf-sage:#7aad89;
          --cf-mist:#c4d9cc; --cf-gold:#c9a84c; --cf-gold-lt:#e8d5a3;
          --cf-warm:#8c8678; --cf-line:#d6cfc4;
        }
        @keyframes cf-shimmer{to{background-position:-200% 0;}}
        @keyframes cf-float{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(20px,-20px) scale(1.05);}}

        .cf-root{background:var(--cf-cream);min-height:100vh;font-family:'Epilogue',sans-serif;color:var(--cf-ink);}

        /* ── HERO ── */
        .cf-hero{background:var(--cf-forest);position:relative;overflow:hidden;padding:88px 0 72px;}
        .cf-hero-blob{position:absolute;border-radius:50%;pointer-events:none;filter:blur(80px);}
        .cf-blob-1{width:500px;height:500px;top:-180px;right:-120px;background:rgba(61,122,82,0.22);animation:cf-float 22s ease-in-out infinite;}
        .cf-blob-2{width:380px;height:380px;bottom:-120px;left:-80px;background:rgba(201,168,76,0.1);animation:cf-float 18s ease-in-out 6s infinite;}
        .cf-hero-inner{max-width:1340px;margin:0 auto;padding:0 56px;position:relative;z-index:1;}
        .cf-hero-eyebrow{
          font-size:10px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;
          color:var(--cf-sage);margin-bottom:32px;display:flex;align-items:center;gap:12px;
        }
        .cf-hero-eyebrow::after{content:'';flex:0 0 40px;height:1px;background:var(--cf-sage);opacity:.45;}
        .cf-hero-title{
          font-family:'Cormorant Garamond',serif;font-size:clamp(48px,8vw,96px);
          font-weight:300;line-height:.95;color:var(--cf-cream);letter-spacing:-.03em;margin-bottom:44px;
        }
        .cf-hero-title em{font-style:italic;color:var(--cf-gold-lt);}
        .cf-hero-rule{width:56px;height:1px;background:rgba(196,217,204,.4);margin-bottom:50px;}
        .cf-hero-stats{display:flex;gap:0;flex-wrap:wrap;}
        .cf-hstat{padding:0 52px 0 0;margin-right:52px;border-right:1px solid rgba(255,255,255,.1);}
        .cf-hstat:last-child{border-right:none;padding-right:0;margin-right:0;}
        .cf-hstat-val{
          font-family:'Cormorant Garamond',serif;font-size:clamp(44px,6vw,72px);
          font-weight:600;line-height:1;color:#fff;letter-spacing:-.03em;display:block;
        }
        .cf-hstat-lbl{font-size:9px;font-weight:600;letter-spacing:.25em;text-transform:uppercase;color:var(--cf-sage);margin-top:7px;display:block;}

        /* ── STICKY NAV ── */
        .cf-nav{background:var(--cf-parchment);border-bottom:1px solid var(--cf-line);position:sticky;top:0;z-index:50;}
        .cf-nav-inner{
          max-width:1340px;margin:0 auto;padding:0 56px;display:flex;align-items:center;
          justify-content:space-between;height:58px;gap:24px;flex-wrap:wrap;
        }
        .cf-nav-count{font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--cf-warm);}
        .cf-fpills{display:flex;gap:2px;}
        .cf-fpill{
          padding:6px 20px;border-radius:100px;font-family:'Epilogue',sans-serif;
          font-size:11px;font-weight:600;letter-spacing:.06em;border:1px solid transparent;
          cursor:pointer;transition:all .2s;background:transparent;color:var(--cf-warm);
        }
        .cf-fpill:hover{color:var(--cf-ink);}
        .cf-fpill.active{background:var(--cf-forest);color:var(--cf-cream);border-color:var(--cf-forest);}

        /* ── CONTENT ── */
        .cf-content{max-width:1340px;margin:0 auto;padding:64px 56px 100px;}
        .cf-section-label{
          font-size:10px;font-weight:600;letter-spacing:.25em;text-transform:uppercase;
          color:var(--cf-warm);margin-bottom:40px;display:flex;align-items:center;gap:16px;
        }
        .cf-section-label::after{content:'';flex:1;height:1px;background:var(--cf-line);}

        /* ── CARD GRID ── */
        .cf-grid{
          display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:24px;
        }

        /* ── FEED CARD ── */
        .cf-card{
          background:#fff;border:1px solid var(--cf-line);border-radius:16px;
          overflow:hidden;cursor:pointer;transition:box-shadow .25s,transform .25s;
          display:flex;flex-direction:column;
        }
        .cf-card:hover{box-shadow:0 8px 40px rgba(0,0,0,.08);transform:translateY(-3px);}

        .cf-card-img{aspect-ratio:16/9;background:var(--cf-mist);overflow:hidden;position:relative;}
        .cf-card-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease;}
        .cf-card:hover .cf-card-img img{transform:scale(1.05);}
        .cf-card-no-img{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:8px;color:var(--cf-warm);font-size:11px;aspect-ratio:16/9;background:var(--cf-parchment);
        }
        .cf-card-health{
          position:absolute;top:12px;right:12px;display:flex;align-items:center;gap:5px;
          padding:5px 12px;border-radius:100px;font-size:10px;font-weight:600;
          backdrop-filter:blur(8px);letter-spacing:.05em;
        }
        .cf-card-time{
          position:absolute;bottom:12px;left:12px;
          background:rgba(26,26,20,.72);backdrop-filter:blur(6px);
          color:#fff;font-size:10px;font-weight:600;letter-spacing:.08em;
          padding:5px 12px;border-radius:100px;display:flex;align-items:center;gap:5px;
        }

        .cf-card-body{padding:24px 24px 20px;flex:1;display:flex;flex-direction:column;}
        .cf-card-site{
          font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;
          color:var(--cf-ink);margin-bottom:6px;letter-spacing:-.02em;line-height:1.2;
        }
        .cf-card-loc{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--cf-warm);margin-bottom:14px;}
        .cf-card-notes{
          font-size:12.5px;line-height:1.7;color:var(--cf-ink2);flex:1;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
          margin-bottom:18px;
        }

        .cf-card-stats{
          display:flex;gap:16px;padding-top:14px;border-top:1px solid var(--cf-line);
        }
        .cf-card-stat{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--cf-warm);font-weight:500;}
        .cf-card-stat-val{font-weight:700;color:var(--cf-ink);}
        .cf-card-stat-icon{opacity:.5;}

        .cf-card-footer{
          padding:12px 24px 16px;display:flex;align-items:center;justify-content:space-between;
          border-top:1px solid var(--cf-line);
        }
        .cf-card-user{font-size:11px;color:var(--cf-warm);display:flex;align-items:center;gap:5px;}
        .cf-card-arrow{
          display:flex;align-items:center;gap:4px;font-size:10px;font-weight:600;
          letter-spacing:.12em;text-transform:uppercase;color:var(--cf-leaf);
          opacity:0;transform:translateX(-4px);transition:all .2s;
        }
        .cf-card:hover .cf-card-arrow{opacity:1;transform:translateX(0);}

        /* ── EMPTY ── */
        .cf-empty{text-align:center;padding:100px 24px;grid-column:1/-1;}
        .cf-empty-title{
          font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;
          color:var(--cf-ink2);margin:18px 0 10px;
        }

        /* responsive */
        @media(max-width:960px){
          .cf-hero-inner,.cf-nav-inner,.cf-content{padding-left:28px;padding-right:28px;}
          .cf-grid{grid-template-columns:1fr;}
        }
        @media(max-width:640px){
          .cf-hero{padding:60px 0 52px;}
          .cf-hero-stats{flex-direction:column;gap:0;}
          .cf-hstat{border-right:none;border-bottom:1px solid rgba(255,255,255,.1);padding:0 0 20px;margin:0 0 20px;}
          .cf-hstat:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
          .cf-nav-inner{height:auto;padding:10px 24px;gap:8px;}
          .cf-content{padding-top:40px;padding-bottom:60px;}
          .cf-grid{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="cf-root">

        {/* ── HERO ── */}
        <div className="cf-hero">
          <div className="cf-hero-blob cf-blob-1" />
          <div className="cf-hero-blob cf-blob-2" />
          <div className="cf-hero-inner">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="cf-hero-eyebrow">TerraSpotter — Community Pulse</div>
              <h1 className="cf-hero-title">
                Watching forests<br /><em>come alive</em>
              </h1>
              <div className="cf-hero-rule" />
            </motion.div>

            <div className="cf-hero-stats">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="cf-hstat">
                    <BoneDark style={{ height: 60, width: 100, marginBottom: 8 }} />
                    <BoneDark style={{ height: 10, width: 80 }} />
                  </div>
                ))
              ) : (
                <>
                  {[
                    { val: stats?.totalUpdates || 0, lbl: "Growth Updates", icon: <Activity size={16} /> },
                    { val: stats?.sitesTracked || 0,  lbl: "Sites Tracked", icon: <BarChart3 size={16} /> },
                    { val: `${stats?.avgSurvivalRate || 0}%`, lbl: "Avg Survival Rate", icon: <Heart size={16} /> },
                  ].map((s, i) => (
                    <motion.div
                      key={i} className="cf-hstat"
                      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: .3 + i * .12, duration: .55 }}
                    >
                      <span className="cf-hstat-val">{s.val}</span>
                      <span className="cf-hstat-lbl">{s.lbl}</span>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── STICKY NAV ── */}
        <div className="cf-nav">
          <div className="cf-nav-inner">
            <span className="cf-nav-count">
              {loading ? "Loading…" : `${filtered.length} Update${filtered.length !== 1 ? "s" : ""}`}
            </span>
            <div className="cf-fpills">
              {[
                { key: "all", label: "All" },
                { key: "recent", label: "Recent" },
                { key: "attention", label: "⚠ Needs Attention" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`cf-fpill${filter === key ? " active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="cf-content">
          <div className="cf-section-label">Community Growth Feed · {new Date().getFullYear()}</div>

          {loading ? (
            <div className="cf-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid var(--cf-line)", borderRadius: 16, overflow: "hidden" }}>
                  <Bone style={{ aspectRatio: "16/9", borderRadius: 0 }} />
                  <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                    <Bone style={{ height: 24, width: "70%" }} />
                    <Bone style={{ height: 12, width: "40%" }} />
                    <Bone style={{ height: 12, width: "90%" }} />
                    <Bone style={{ height: 12, width: "80%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="cf-grid">
              <div className="cf-empty">
                <Sprout size={52} strokeWidth={1} />
                <div className="cf-empty-title">No growth updates yet</div>
                <p style={{ fontSize: 13, color: "var(--cf-warm)" }}>
                  Visit a completed plantation site and submit the first growth update.
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              className="cf-grid"
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: .06 } } }}
            >
              {filtered.map((u, idx) => (
                <FeedCard key={u.id || idx} update={u} onClick={() => navigate(`/lands/${u.landId}/growth`)} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Feed Card ─── */
function FeedCard({ update, onClick }) {
  const h = getHealth(update.healthStatus);
  const images = update.images?.map(img => typeof img === "string" ? img : img.imageUrl) || [];
  const thumbSrc = images[0] || null;

  return (
    <motion.div
      className="cf-card"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: .45, ease: [.22, 1, .36, 1] } },
      }}
    >
      {/* Image */}
      <div className="cf-card-img">
        {thumbSrc ? (
          <img src={thumbSrc} alt={update.landTitle} onError={e => { e.target.src = "https://placehold.co/400x225?text=🌿"; }} />
        ) : (
          <div className="cf-card-no-img">
            <TreePine size={32} strokeWidth={1} />
            <span>No photos</span>
          </div>
        )}
        <div className="cf-card-health" style={{ background: h.bg, color: h.color }}>
          {h.icon} {update.healthStatus}
        </div>
        <div className="cf-card-time">
          <Clock size={10} /> {timeAgo(update.createdAt)}
        </div>
      </div>

      {/* Body */}
      <div className="cf-card-body">
        <div className="cf-card-site">{update.landTitle || "Plantation Site"}</div>
        <div className="cf-card-loc">
          <MapPin size={11} strokeWidth={1.5} />
          {update.landLocation || "Location unknown"}
        </div>
        {update.notes && <p className="cf-card-notes">{update.notes}</p>}

        <div className="cf-card-stats">
          <div className="cf-card-stat">
            <TrendingUp size={12} className="cf-card-stat-icon" />
            <span className="cf-card-stat-val">{update.averageHeightCm || "—"}</span> cm
          </div>
          <div className="cf-card-stat">
            <Heart size={12} className="cf-card-stat-icon" />
            <span className="cf-card-stat-val">{update.survivalRate ?? "—"}%</span> survival
          </div>
          {update.landTreesPlanted > 0 && (
            <div className="cf-card-stat">
              <TreePine size={12} className="cf-card-stat-icon" />
              <span className="cf-card-stat-val">{update.landTreesPlanted}</span> trees
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="cf-card-footer">
        <div className="cf-card-user">
          <Users size={11} /> {update.userName || "Community member"}
        </div>
        <div className="cf-card-arrow">
          View Site <ChevronRight size={12} />
        </div>
      </div>
    </motion.div>
  );
}
