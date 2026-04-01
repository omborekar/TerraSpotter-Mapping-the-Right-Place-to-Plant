import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import LoadingSpinner from "./ui/LoadingSpinner";
import AdminLandDetail from "./AdminLandDetail";

const BASE_URL = import.meta.env.VITE_API_URL;

const statusBadge = (status) => {
  const map = {
    PENDING:  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Pending" },
    APPROVED: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Approved" },
    REJECTED: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", label: "Rejected" },
  };
  return map[status] || map.PENDING;
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ────────────────────────────────────────────────────────────
   CardImage — fetches thumbnail from /api/lands/:id/images
   (same endpoint Browse & SiteDetail use)
──────────────────────────────────────────────────────────── */
function CardImage({ landId }) {
  const [thumb,  setThumb]  = useState(null);
  const [extra,  setExtra]  = useState(0);
  const [status, setStatus] = useState("loading"); // loading | loaded | empty

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/lands/${landId}/images`, { withCredentials: true })
      .then(res => {
        const imgs = Array.isArray(res.data) ? res.data : [];
        if (imgs.length > 0) {
          setThumb(imgs[0].imageUrl);
          setExtra(imgs.length - 1);
          setStatus("loaded");
        } else {
          setStatus("empty");
        }
      })
      .catch(() => setStatus("empty"));
  }, [landId]);

  if (status === "loading") return <div className="adm-img-shimmer" />;

  if (status === "empty" || !thumb) {
    return (
      <div className="adm-img-placeholder">
        <span>🌍</span>
        <p>No photos</p>
      </div>
    );
  }

  return (
    <>
      <img
        src={thumb}
        alt="land"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={e => { e.target.src = "https://via.placeholder.com/220x220/edf7f2/0b2e1a?text=🌿"; }}
      />
      {extra > 0 && <span className="adm-img-count">+{extra} more</span>}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Main
──────────────────────────────────────────────────────────── */
export default function AdminPendingLands() {
  const [lands,        setLands]        = useState([]);
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [landsLoading, setLandsLoading] = useState(false);
  const [voting,       setVoting]       = useState({});
  const [selectedId,   setSelectedId]   = useState(null);
  const [filter,       setFilter]       = useState("ALL");

  /* session */
  useEffect(() => {
    axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /* ── fetch ALL lands so Approved/Rejected counts are live ──
     Tries /api/lands first (all statuses), falls back to /api/lands/pending */
  const fetchLands = useCallback(async () => {
    setLandsLoading(true);
    try {
      let res;
      try {
        res = await axios.get(`${BASE_URL}/api/lands`, { withCredentials: true });
      } catch {
        res = await axios.get(`${BASE_URL}/api/lands/pending`, { withCredentials: true });
      }
      setLands(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchLands:", err);
    } finally {
      setLandsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchLands();
  }, [user, fetchLands]);

  /* vote — optimistic update + background refetch */
  const handleVote = async (landId, vote) => {
    setVoting(v => ({ ...v, [landId]: vote }));
    try {
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, {
        withCredentials: true,
        params: { vote, userId: user.id },
      });
      // Flip status instantly in local state (1-vote system)
      setLands(prev =>
        prev.map(l =>
          l.id === landId
            ? { ...l, status: vote === "APPROVE" ? "APPROVED" : "REJECTED" }
            : l
        )
      );
      // Background refetch to keep counts in sync with server
      fetchLands();
    } catch (err) {
      console.error(err);
      alert("Error processing vote. Please try again.");
      fetchLands();
    } finally {
      setVoting(v => ({ ...v, [landId]: null }));
    }
  };

  /* guards */
  if (loading) return <LoadingSpinner text="Loading session…" />;
  if (!user?.role) return (
    <div style={g.guard}><span style={g.icon}>🔒</span><p>No active session</p></div>
  );
  if (user.role !== "ADMIN") return (
    <div style={g.guard}><span style={g.icon}>🚫</span><p>Access Denied — Admins only</p></div>
  );

  /* detail drill-in */
  if (selectedId) return (
    <AdminLandDetail
      landId={selectedId}
      user={user}
      onBack={() => { setSelectedId(null); fetchLands(); }}
      onVote={handleVote}
      voting={voting}
    />
  );

  const filtered = filter === "ALL" ? lands : lands.filter(l => l.status === filter);
  const counts = {
    ALL:      lands.length,
    PENDING:  lands.filter(l => l.status === "PENDING").length,
    APPROVED: lands.filter(l => l.status === "APPROVED").length,
    REJECTED: lands.filter(l => l.status === "REJECTED").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --forest:#0b2e1a; --mid:#1f5c35; --leaf:#2d8a55; --sprout:#3db06e;
          --mint:#d4f0e0; --pale:#edf7f2; --white:#fff;
          --ink:#111b14; --body:#3d5244; --muted:#7a9485;
          --line:#dceee4; --sand:#f9fbf9;
          --red:#dc2626; --red-bg:#fef2f2; --red-border:#fecaca;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--sand); color:var(--ink); }

        .adm-page { max-width:1200px; margin:0 auto; padding:40px 32px 80px; }

        /* header */
        .adm-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; gap:20px; flex-wrap:wrap; }
        .adm-eyebrow { font-size:10px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:var(--leaf); margin-bottom:5px; }
        .adm-title { font-family:'Syne',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:800; color:var(--forest); line-height:1.1; }

        /* filters */
        .adm-filters { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
        .adm-filter-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:8px 16px; border-radius:100px; font-size:13px; font-weight:600;
          border:1.5px solid var(--line); background:var(--white); color:var(--body);
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
        }
        .adm-filter-btn:hover { border-color:var(--sprout); color:var(--forest); }
        .adm-filter-btn.active { background:var(--forest); color:white; border-color:var(--forest); }
        .adm-filter-count { font-size:11px; font-weight:700; padding:1px 7px; border-radius:100px; }
        .adm-filter-btn:not(.active) .adm-filter-count { background:var(--pale); color:var(--muted); }
        .adm-filter-btn.active .adm-filter-count { background:rgba(255,255,255,.2); }

        /* loading bar */
        .adm-loading-bar {
          height:3px; border-radius:2px; margin-bottom:16px;
          background:linear-gradient(90deg,var(--sprout),var(--leaf),var(--sprout));
          background-size:200% 100%; animation:loadbar 1.2s linear infinite;
        }
        @keyframes loadbar { to { background-position:-200% 0; } }

        /* summary tiles */
        .adm-summary { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
        .adm-sum-tile {
          background:var(--white); border:1px solid var(--line); border-radius:14px;
          padding:18px 20px; transition:box-shadow .2s;
        }
        .adm-sum-tile:hover { box-shadow:0 4px 16px rgba(11,46,26,.08); }
        .adm-sum-val { font-family:'Syne',sans-serif; font-size:34px; font-weight:800; line-height:1; margin-bottom:5px; }
        .adm-sum-lbl { font-size:11px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; }

        /* empty */
        .adm-empty { text-align:center; padding:80px 20px; color:var(--muted); }
        .adm-empty-icon { font-size:48px; margin-bottom:16px; }
        .adm-empty h3 { font-family:'Syne',sans-serif; font-size:20px; color:var(--forest); margin-bottom:8px; }

        /* card */
        .adm-card {
          background:var(--white); border:1px solid var(--line); border-radius:18px;
          overflow:hidden; display:grid; grid-template-columns:220px 1fr;
          box-shadow:0 2px 12px rgba(11,46,26,.05);
          transition:box-shadow .25s, transform .25s, border-color .2s;
        }
        .adm-card:hover { box-shadow:0 8px 32px rgba(11,46,26,.1); transform:translateY(-2px); border-color:var(--mint); }

        /* image */
        .adm-card-img {
          position:relative; background:var(--pale);
          min-height:200px; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
        }
        .adm-img-shimmer {
          position:absolute; inset:0;
          background:linear-gradient(90deg,var(--pale) 25%,#d8ede4 50%,var(--pale) 75%);
          background-size:200% 100%; animation:shimmer 1.3s infinite;
        }
        @keyframes shimmer { to { background-position:-200% 0; } }
        .adm-img-placeholder {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:6px; color:var(--muted); width:100%; height:100%; min-height:200px;
        }
        .adm-img-placeholder span { font-size:34px; opacity:.45; }
        .adm-img-placeholder p { font-size:12px; }
        .adm-img-count {
          position:absolute; bottom:10px; right:10px;
          background:rgba(0,0,0,.55); color:white; font-size:11px; font-weight:600;
          padding:3px 9px; border-radius:100px; backdrop-filter:blur(4px);
        }

        /* decided overlay */
        .adm-overlay {
          position:absolute; inset:0;
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:18px; font-weight:800;
          letter-spacing:.5px; pointer-events:none;
        }
        .adm-overlay.approved { background:rgba(21,128,61,.2); color:#166534; }
        .adm-overlay.rejected { background:rgba(185,28,28,.15); color:#991b1b; }

        /* body */
        .adm-card-body { padding:22px 26px; display:flex; flex-direction:column; gap:11px; }
        .adm-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .adm-card-title { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; color:var(--forest); line-height:1.2; }

        .adm-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 11px; border-radius:100px; font-size:11px; font-weight:700;
          letter-spacing:.06em; white-space:nowrap; border:1px solid; flex-shrink:0;
        }
        .adm-badge-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }

        .adm-meta { display:flex; flex-wrap:wrap; gap:14px; }
        .adm-meta-item { display:flex; align-items:center; gap:5px; font-size:13px; color:var(--body); }

        .adm-desc {
          font-size:13px; color:var(--body); line-height:1.65;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }

        .adm-tags { display:flex; flex-wrap:wrap; gap:6px; }
        .adm-tag { font-size:11px; font-weight:600; background:var(--pale); border:1px solid var(--line); color:var(--mid); border-radius:6px; padding:3px 10px; }

        .adm-card-footer {
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          margin-top:auto; padding-top:10px; border-top:1px solid var(--line); flex-wrap:wrap;
        }
        .adm-footer-left { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

        .adm-view-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 16px; background:var(--pale); border:1px solid var(--line);
          border-radius:8px; font-size:13px; font-weight:600; color:var(--forest);
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
        }
        .adm-view-btn:hover { background:var(--mint); border-color:var(--sprout); }

        .adm-vote-btns { display:flex; gap:8px; }

        .adm-btn-approve {
          display:inline-flex; align-items:center; gap:6px;
          padding:9px 20px; background:var(--forest); color:white;
          border:none; border-radius:8px; font-family:'DM Sans',sans-serif;
          font-size:13px; font-weight:700; cursor:pointer; transition:background .2s,transform .15s;
        }
        .adm-btn-approve:hover:not(:disabled) { background:var(--mid); transform:translateY(-1px); }
        .adm-btn-approve:disabled { opacity:.55; cursor:not-allowed; }

        .adm-btn-reject {
          display:inline-flex; align-items:center; gap:6px;
          padding:9px 20px; background:var(--red-bg); color:var(--red);
          border:1.5px solid var(--red-border); border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700;
          cursor:pointer; transition:all .2s;
        }
        .adm-btn-reject:hover:not(:disabled) { background:#fee2e2; }
        .adm-btn-reject:disabled { opacity:.55; cursor:not-allowed; }

        .adm-submitter { font-size:12px; color:var(--muted); display:flex; align-items:center; gap:5px; }
        .adm-submitter-avatar {
          width:22px; height:22px; border-radius:50%;
          background:linear-gradient(135deg,var(--mid),var(--sprout));
          color:white; display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:700; flex-shrink:0;
        }

        @media(max-width:768px){
          .adm-page { padding:24px 16px 60px; }
          .adm-card { grid-template-columns:1fr; }
          .adm-card-img { height:160px; min-height:160px; }
          .adm-summary { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="adm-page">

        {/* Header */}
        <div className="adm-header">
          <div>
            <div className="adm-eyebrow">Admin Panel</div>
            <h1 className="adm-title">Land Review Queue</h1>
          </div>
          <div className="adm-filters">
            {["ALL","PENDING","APPROVED","REJECTED"].map(f => (
              <button
                key={f}
                className={`adm-filter-btn${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                <span className="adm-filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading bar */}
        {landsLoading && <div className="adm-loading-bar" />}

        {/* Summary — counts update live after every vote */}
        <div className="adm-summary">
          {[
            { val: counts.ALL,      lbl: "Total Submissions", color: "#0b2e1a" },
            { val: counts.PENDING,  lbl: "Awaiting Review",   color: "#c2410c" },
            { val: counts.APPROVED, lbl: "Approved",          color: "#15803d" },
            { val: counts.REJECTED, lbl: "Rejected",          color: "#b91c1c" },
          ].map((s, i) => (
            <div key={i} className="adm-sum-tile">
              <div className="adm-sum-val" style={{ color: s.color }}>{s.val}</div>
              <div className="adm-sum-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Land list */}
        {filtered.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">🌿</div>
            <h3>No {filter === "ALL" ? "" : filter.toLowerCase() + " "}submissions</h3>
            <p>Check back later or adjust your filter.</p>
          </div>
        ) : (
          <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map(land => {
              const badge    = statusBadge(land.status);
              const isVoting = voting[land.id];
              const submitterName =
                land.createdByName || land.submittedByName ||
                (land.createdBy   ? `User #${land.createdBy}`   : null) ||
                (land.submittedBy ? `User #${land.submittedBy}` : null);
              const submitterInitial = (submitterName || "?")?.[0]?.toUpperCase();

              return (
                <motion.div key={land.id} className="adm-card" variants={cardVariants}>

                  {/* Image — fetched fresh from /api/lands/:id/images */}
                  <div className="adm-card-img">
                    <CardImage landId={land.id} />
                    {land.status === "APPROVED" && (
                      <div className="adm-overlay approved">✓ APPROVED</div>
                    )}
                    {land.status === "REJECTED" && (
                      <div className="adm-overlay rejected">✕ REJECTED</div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="adm-card-body">
                    <div className="adm-card-top">
                      <h2 className="adm-card-title">{land.title || "Untitled Land"}</h2>
                      <span
                        className="adm-badge"
                        style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}
                      >
                        <span className="adm-badge-dot" />
                        {badge.label}
                      </span>
                    </div>

                    <div className="adm-meta">
                      {land.areaSqm   && <span className="adm-meta-item">📐 {(land.areaSqm/10000).toFixed(2)} ha</span>}
                      {land.ownerName && <span className="adm-meta-item">👤 {land.ownerName}</span>}
                      {land.ownerPhone && <span className="adm-meta-item">📞 {land.ownerPhone}</span>}
                      {land.createdAt  && (
                        <span className="adm-meta-item">
                          🗓 {new Date(land.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </span>
                      )}
                      {land.waterAvailable && <span className="adm-meta-item">💧 {land.waterAvailable}</span>}
                    </div>

                    {land.description && <p className="adm-desc">{land.description}</p>}

                    <div className="adm-tags">
                      {land.soilType       && <span className="adm-tag">🪨 {land.soilType}</span>}
                      {land.ownershipType  && <span className="adm-tag">🏷 {land.ownershipType}</span>}
                      {land.fencing !== undefined && (
                        <span className="adm-tag">{land.fencing ? "🔒 Fenced" : "⛓ No Fence"}</span>
                      )}
                      {land.accessRoad  && <span className="adm-tag">🛤 {land.accessRoad}</span>}
                      {land.landStatus  && <span className="adm-tag">📊 {land.landStatus}</span>}
                    </div>

                    <div className="adm-card-footer">
                      <div className="adm-footer-left">
                        <button className="adm-view-btn" onClick={() => setSelectedId(land.id)}>
                          🔍 View Details
                        </button>
                        {submitterName && (
                          <span className="adm-submitter">
                            <span className="adm-submitter-avatar">{submitterInitial}</span>
                            {submitterName}
                          </span>
                        )}
                      </div>

                      {land.status === "PENDING" && (
                        <div className="adm-vote-btns">
                          <button
                            className="adm-btn-approve"
                            onClick={() => handleVote(land.id, "APPROVE")}
                            disabled={!!isVoting}
                          >
                            {isVoting === "APPROVE" ? "⏳ Approving…" : "✅ Approve"}
                          </button>
                          <button
                            className="adm-btn-reject"
                            onClick={() => handleVote(land.id, "REJECT")}
                            disabled={!!isVoting}
                          >
                            {isVoting === "REJECT" ? "⏳ Rejecting…" : "❌ Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}

const g = {
  guard: {
    display:"flex", flexDirection:"column", alignItems:"center",
    justifyContent:"center", minHeight:"60vh", gap:12,
    fontFamily:"'DM Sans',sans-serif", color:"#3d5244", fontSize:15,
  },
  icon: { fontSize: 42 },
};