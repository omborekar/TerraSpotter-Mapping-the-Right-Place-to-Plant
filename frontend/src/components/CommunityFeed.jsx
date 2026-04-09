/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Global community feed showing completed plantations.
*/
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine, TrendingUp, Heart, Sprout, Droplets, Sun, AlertTriangle,
  MapPin, Clock, ChevronRight, Users, BarChart3, Activity, Star, Camera,
  Navigation, CheckCircle, Crosshair, X
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─── Time-ago ─── */
function timeAgo(dateStr) {
  if (!dateStr) return "Some time ago";
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

/* ─── Distance Helpers ─── */
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
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
  const [plantations, setPlantations] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("recent"); // recent, popular, nearest
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLandId, setSelectedLandId] = useState(null);
  const [selectedCompletionId, setSelectedCompletionId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
        const [planRes, statsRes] = await Promise.all([
            fetch(`${BASE_URL}/api/plantations/completed`, { credentials: "include" }),
            fetch(`${BASE_URL}/api/growth/stats`, { credentials: "include" })
        ]);
        if (planRes.ok) setPlantations(await planRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) { console.error("Failed to fetch community data:", err); }
    finally { setLoading(false); }
  };

  const handleClosest = () => {
    if (userLoc) {
        setFilter("nearest");
        return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFilter("nearest");
        setLocLoading(false);
    }, err => {
        console.error(err);
        setLocLoading(false);
        alert("Location access denied or unavailable.");
    });
  };

  // Sort logic
  const sorted = [...plantations].sort((a, b) => {
    if (filter === "recent") return new Date(b.completedAt) - new Date(a.completedAt);
    if (filter === "popular") return (b.reviews?.length || 0) - (a.reviews?.length || 0);
    if (filter === "nearest" && userLoc) {
        const da = getDistance(userLoc.lat, userLoc.lng, a.centroidLat, a.centroidLng);
        const db = getDistance(userLoc.lat, userLoc.lng, b.centroidLat, b.centroidLng);
        return da - db;
    }
    return 0;
  });

  const handleOpenReview = (landId, completionId, e) => {
      e.stopPropagation();
      setSelectedLandId(landId);
      setSelectedCompletionId(completionId);
      setShowReviewModal(true);
  };

  const handleOpenGrowth = (landId, e) => {
      e.stopPropagation();
      navigate(`/lands/${landId}/growth`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400\\&family=Epilogue:wght@300;400;500;600;700\\&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root {
          --cf-cream:#f5f0e8; --cf-parchment:#ede7d9; --cf-ink:#1a1a14; --cf-ink2:#2e2e24;
          --cf-forest:#1c3a25; --cf-moss:#2d5a3d; --cf-leaf:#3d7a52; --cf-sage:#7aad89;
          --cf-mist:#c4d9cc; --cf-gold:#c9a84c; --cf-gold-lt:#e8d5a3;
          --cf-warm:#8c8678; --cf-line:#d6cfc4;
        }
        @keyframes cf-shimmer{to{background-position:-200% 0;}}
        @keyframes cf-float{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(20px,-20px) scale(1.05);}}
        @keyframes cf-spin { to { transform: rotate(360deg); } }

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
        .cf-fpills{display:flex;gap:4px;}
        .cf-fpill{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 20px;border-radius:100px;font-family:'Epilogue',sans-serif;
          font-size:11px;font-weight:600;letter-spacing:.06em;border:1px solid transparent;
          cursor:pointer;transition:all .2s;background:transparent;color:var(--cf-warm);
        }
        .cf-fpill:hover{color:var(--cf-ink);}
        .cf-fpill.active{background:var(--cf-forest);color:var(--cf-cream);border-color:var(--cf-forest);}
        .cf-spin { animation: cf-spin 1s linear infinite; }

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
        .cf-card-time{
          position:absolute;top:12px;right:12px;
          background:rgba(26,26,20,.72);backdrop-filter:blur(6px);
          color:#fff;font-size:10px;font-weight:600;letter-spacing:.08em;
          padding:5px 12px;border-radius:100px;display:flex;align-items:center;gap:5px;
        }
        .cf-card-dist{
          position:absolute;bottom:12px;left:12px;
          background:rgba(255,255,255,.9);backdrop-filter:blur(6px);
          color:var(--cf-ink);font-size:10px;font-weight:700;letter-spacing:.08em;
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

        .cf-card-actions{
          padding:12px 24px 16px;display:flex;flex-wrap:wrap;gap:10px;
          border-top:1px solid var(--cf-line);background:#fcfbf9;
        }
        .cf-btn-outline{
          flex:1;padding:10px;border:1px solid var(--cf-line);border-radius:8px;
          background:#fff;font-family:'Epilogue',sans-serif;font-size:11px;font-weight:600;
          color:var(--cf-ink);text-align:center;cursor:pointer;transition:all .2s;
          display:flex;align-items:center;justify-content:center;gap:6px;
        }
        .cf-btn-outline:hover{border-color:var(--cf-leaf);color:var(--cf-leaf);}
        .cf-btn-solid{
          flex:1;padding:10px;border:none;border-radius:8px;
          background:var(--cf-forest);font-family:'Epilogue',sans-serif;font-size:11px;font-weight:600;
          color:var(--cf-cream);text-align:center;cursor:pointer;transition:all .2s;
          display:flex;align-items:center;justify-content:center;gap:6px;
        }
        .cf-btn-solid:hover{background:var(--cf-moss);}

        /* ── EMPTY ── */
        .cf-empty{text-align:center;padding:100px 24px;grid-column:1/-1;}
        .cf-empty-title{
          font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300;
          color:var(--cf-ink2);margin:18px 0 10px;
        }
        
        /* ── REVIEW MODAL ── */
        .cf-rmodal-overlay {
          position:fixed;inset:0;background:rgba(26,26,20,0.84);backdrop-filter:blur(8px);
          z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;
        }
        .cf-rmodal {
          background:var(--cf-cream);border-radius:12px;max-width:540px;width:100%;
          position:relative;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.2);
        }
        .cf-rmodal-body { padding:40px; }
        .cf-rmodal-title {
          font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:600;
          color:var(--cf-ink);margin-bottom:24px;letter-spacing:-.02em;line-height:1.1;
        }
        .cf-rmodal-close {
          position:absolute;top:16px;right:16px;background:none;border:none;
          color:var(--cf-warm);cursor:pointer;transition:color .2s;
        }
        .cf-rmodal-close:hover { color:var(--cf-ink); }
        .cf-flabel {
          display:block;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
          color:var(--cf-warm);margin-bottom:12px;
        }
        .cf-star-row { display:flex;gap:8px;margin-bottom:24px; }
        .cf-star { cursor:pointer;transition:transform .15s; }
        .cf-star:hover { transform:scale(1.1); }
        .cf-textarea {
          width:100%;min-height:100px;padding:14px;border:1px solid var(--cf-line);
          border-radius:8px;font-family:'Epilogue',sans-serif;font-size:14px;
          background:#fff;outline:none;resize:vertical;margin-bottom:24px;
        }
        .cf-textarea:focus { border-color:var(--cf-forest); }
        .cf-btn-submit-review {
          width:100%;padding:14px;border:none;background:var(--cf-forest);color:#fff;
          border-radius:8px;font-family:'Epilogue',sans-serif;font-size:13px;font-weight:600;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .cf-btn-submit-review:disabled { opacity:.6;cursor:not-allowed; }

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
                    { val: plantations.length || 0, lbl: "Completed Plantations", icon: <CheckCircle size={16} /> },
                    { val: stats?.totalUpdates || 0, lbl: "Growth Updates", icon: <Activity size={16} /> },
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
              {loading ? "Loading…" : `${sorted.length} Plantation${sorted.length !== 1 ? "s" : ""}`}
            </span>
            <div className="cf-fpills">
              <button className={`cf-fpill${filter === "recent" ? " active" : ""}`} onClick={() => setFilter("recent")}>
                  Recent
              </button>
              <button className={`cf-fpill${filter === "popular" ? " active" : ""}`} onClick={() => setFilter("popular")}>
                  Popular
              </button>
              <button className={`cf-fpill${filter === "nearest" ? " active" : ""}`} onClick={handleClosest}>
                  {locLoading ? <Navigation size={12} className="cf-spin" /> : <Crosshair size={12} />} Nearest to me
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="cf-content">
          <div className="cf-section-label">Community Plantations Feed · {new Date().getFullYear()}</div>

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
          ) : sorted.length === 0 ? (
            <div className="cf-grid">
              <div className="cf-empty">
                <Sprout size={52} strokeWidth={1} />
                <div className="cf-empty-title">No completed plantations yet</div>
                <p style={{ fontSize: 13, color: "var(--cf-warm)" }}>
                  There are no completed plantations available to track or review.
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              className="cf-grid"
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: .06 } } }}
            >
              {sorted.map((u, idx) => {
                  let distanceStr = null;
                  if (userLoc && u.centroidLat && u.centroidLng) {
                      const dist = getDistance(userLoc.lat, userLoc.lng, u.centroidLat, u.centroidLng);
                      distanceStr = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
                  }
                  
                  return (
                    <FeedCard 
                        key={u.id || idx} 
                        update={u} 
                        distStr={distanceStr}
                        onReview={(e) => handleOpenReview(u.landId, u.id, e)}
                        onGrowth={(e) => handleOpenGrowth(u.landId, e)}
                        onClick={() => navigate(`/lands/${u.landId}`)} 
                    />
                  );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── REVIEW MODAL ── */}
      <AnimatePresence>
        {showReviewModal && (
            <CommunityReviewModal 
                completionId={selectedCompletionId} 
                onClose={() => setShowReviewModal(false)} 
                onSuccess={() => { setShowReviewModal(false); fetchAll(); }}
            />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Feed Card ─── */
function FeedCard({ update, distStr, onClick, onReview, onGrowth }) {
  const images = update.images || [];
  const thumbSrc = images[0] || null;
  const avgRating = update.reviews?.length
    ? (update.reviews.reduce((s, r) => s + r.rating, 0) / update.reviews.length).toFixed(1)
    : null;

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
          <img src={thumbSrc} alt={update.title} onError={e => { e.target.src = "https://placehold.co/400x225?text=🌿"; }} />
        ) : (
          <div className="cf-card-no-img">
            <TreePine size={32} strokeWidth={1} />
            <span>No photos</span>
          </div>
        )}
        <div className="cf-card-time">
          <Clock size={10} /> {timeAgo(update.completedAt)}
        </div>
        {distStr && (
            <div className="cf-card-dist">
                <MapPin size={10} /> {distStr}
            </div>
        )}
      </div>

      {/* Body */}
      <div className="cf-card-body">
        <div className="cf-card-site">{update.title || "Plantation Site"}</div>
        <div className="cf-card-loc">
          <MapPin size={11} strokeWidth={1.5} />
          {update.location || "Location unknown"}
        </div>
        {update.notes && <p className="cf-card-notes">{update.notes}</p>}

        <div className="cf-card-stats">
          <div className="cf-card-stat">
            <TreePine size={12} className="cf-card-stat-icon" />
            <span className="cf-card-stat-val">{(update.treesPlanted || 0).toLocaleString()}</span> trees
          </div>
          <div className="cf-card-stat">
            <Users size={12} className="cf-card-stat-icon" />
            <span className="cf-card-stat-val">{update.teamName || "Community"}</span>
          </div>
          <div className="cf-card-stat">
            <Star size={12} className="cf-card-stat-icon" />
            <span className="cf-card-stat-val">{avgRating || "No reviews"}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="cf-card-actions">
          <button className="cf-btn-outline" onClick={onReview}>
              <Star size={13} /> Add Review
          </button>
          <button className="cf-btn-solid" onClick={onGrowth}>
              <TrendingUp size={13} /> Track Growth
          </button>
      </div>
    </motion.div>
  );
}

/* ─── Simple Community Review Modal ─── */
function CommunityReviewModal({ completionId, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rating) return alert("Please select a rating!");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("rating", rating);
            formData.append("comment", comment);
            
            const res = await fetch(`${BASE_URL}/api/plantations/${completionId}/review`, {
                method: "POST", body: formData, credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to submit review");
            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Error submitting review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="cf-rmodal-overlay" onClick={e => e.target === e.currentTarget && onClose()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="cf-rmodal" initial={{ scale: .9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9, y: 20 }}>
                <button className="cf-rmodal-close" onClick={onClose}><X size={20}/></button>
                <div className="cf-rmodal-body">
                    <h2 className="cf-rmodal-title">Add a Review</h2>
                    
                    <label className="cf-flabel">Overall Rating</label>
                    <div className="cf-star-row">
                        {[1,2,3,4,5].map(v => (
                            <Star 
                                key={v} size={28} className="cf-star"
                                fill={(hovered || rating) >= v ? "var(--cf-gold)" : "transparent"}
                                stroke={(hovered || rating) >= v ? "var(--cf-gold)" : "var(--cf-line)"}
                                onMouseEnter={() => setHovered(v)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(v)}
                            />
                        ))}
                    </div>

                    <label className="cf-flabel">Your Experience / Observations (Optional)</label>
                    <textarea 
                        className="cf-textarea" 
                        placeholder="How is the plantation doing? Was it a good effort by the community?"
                        value={comment} onChange={e => setComment(e.target.value)}
                    />

                    <button className="cf-btn-submit-review" onClick={handleSubmit} disabled={loading || !rating}>
                        {loading ? <div className="cf-spin"><Activity size={16}/></div> : "Submit Review"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
