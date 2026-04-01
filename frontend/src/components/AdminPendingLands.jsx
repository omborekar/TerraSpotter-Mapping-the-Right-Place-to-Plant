import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function AdminPendingLands() {
  const [lands, setLands]           = useState([]);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [voting, setVoting]         = useState({}); // landId -> "APPROVE"|"REJECT"|null
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter]         = useState("ALL");

  // fetch session
  useEffect(() => {
    axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const fetchLands = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/lands/pending`, { withCredentials: true });
      setLands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") fetchLands();
  }, [user]);

  const handleVote = async (landId, vote) => {
    setVoting(v => ({ ...v, [landId]: vote }));
    try {
      // ✅ FIX: correct API path — was `${BASE_URL}/lands/...` (missing /api/)
      await axios.post(`${BASE_URL}/api/lands/${landId}/verify`, null, {
        withCredentials: true,
        params: { vote, userId: user.id },
      });
      await fetchLands();
    } catch (err) {
      console.error(err);
      alert("Error processing vote. Please try again.");
    } finally {
      setVoting(v => ({ ...v, [landId]: null }));
    }
  };

  // guards
  if (loading) return <LoadingSpinner text="Loading session…" />;
  if (!user?.role) return (
    <div style={styles.guard}>
      <span style={styles.guardIcon}>🔒</span>
      <p>No active session</p>
    </div>
  );
  if (user.role !== "ADMIN") return (
    <div style={styles.guard}>
      <span style={styles.guardIcon}>🚫</span>
      <p>Access Denied — Admins only</p>
    </div>
  );

  // open detail view
  if (selectedId) return (
    <AdminLandDetail
      landId={selectedId}
      user={user}
      onBack={() => { setSelectedId(null); fetchLands(); }} // ✅ refresh list when coming back
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --forest: #0b2e1a; --mid: #1f5c35; --leaf: #2d8a55; --sprout: #3db06e;
          --mint: #d4f0e0; --pale: #edf7f2; --white: #fff;
          --ink: #111b14; --body: #3d5244; --muted: #7a9485;
          --line: #dceee4; --sand: #f9fbf9;
          --red: #dc2626; --red-bg: #fef2f2; --red-border: #fecaca;
          --amber: #d97706; --amber-bg: #fffbeb; --amber-border: #fde68a;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--sand); color: var(--ink); }

        .adm-page { max-width: 1200px; margin: 0 auto; padding: 40px 32px 80px; }

        /* header */
        .adm-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 36px; gap: 20px; flex-wrap: wrap; }
        .adm-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--leaf); margin-bottom: 6px; }
        .adm-title { font-family: 'Syne', sans-serif; font-size: clamp(26px, 4vw, 38px); font-weight: 800; color: var(--forest); line-height: 1.1; }

        /* filter tabs */
        .adm-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .adm-filter-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600;
          border: 1.5px solid var(--line); background: var(--white); color: var(--body);
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .adm-filter-btn:hover { border-color: var(--sprout); color: var(--forest); }
        .adm-filter-btn.active { background: var(--forest); color: white; border-color: var(--forest); }
        .adm-filter-count { font-size: 11px; background: rgba(255,255,255,0.2); padding: 1px 7px; border-radius: 100px; }
        .adm-filter-btn:not(.active) .adm-filter-count { background: var(--pale); color: var(--muted); }

        /* summary bar */
        .adm-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 32px; }
        .adm-sum-tile { background: var(--white); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; }
        .adm-sum-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--forest); line-height: 1; margin-bottom: 4px; }
        .adm-sum-lbl { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }

        /* empty */
        .adm-empty { text-align: center; padding: 80px 20px; color: var(--muted); }
        .adm-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .adm-empty h3 { font-family: 'Syne', sans-serif; font-size: 20px; color: var(--forest); margin-bottom: 8px; }

        /* land card */
        .adm-card {
          background: var(--white); border: 1px solid var(--line); border-radius: 18px;
          overflow: hidden; display: grid; grid-template-columns: 220px 1fr;
          box-shadow: 0 2px 12px rgba(11,46,26,0.05);
          transition: box-shadow 0.25s, transform 0.25s, border-color 0.2s;
        }
        .adm-card:hover { box-shadow: 0 8px 32px rgba(11,46,26,0.1); transform: translateY(-2px); border-color: var(--mint); }

        /* image strip */
        .adm-card-img { position: relative; background: var(--pale); min-height: 180px; overflow: hidden; }
        .adm-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .adm-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: var(--muted); }
        .adm-img-count {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(0,0,0,0.55); color: white; font-size: 11px; font-weight: 600;
          padding: 3px 9px; border-radius: 100px; backdrop-filter: blur(4px);
        }

        /* card body */
        .adm-card-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 12px; }
        .adm-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .adm-card-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--forest); line-height: 1.2; }

        .adm-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 100px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; white-space: nowrap; border: 1px solid;
          flex-shrink: 0;
        }
        .adm-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        .adm-meta { display: flex; flex-wrap: wrap; gap: 16px; }
        .adm-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--body); }
        .adm-meta-icon { font-size: 14px; }

        .adm-desc { font-size: 13.5px; color: var(--body); line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .adm-tags { display: flex; flex-wrap: wrap; gap: 7px; }
        .adm-tag { font-size: 11px; font-weight: 600; background: var(--pale); border: 1px solid var(--line); color: var(--mid); border-radius: 6px; padding: 3px 10px; }

        .adm-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--line); flex-wrap: wrap; }

        .adm-view-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; background: var(--pale); border: 1px solid var(--line);
          border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--forest);
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .adm-view-btn:hover { background: var(--mint); border-color: var(--sprout); }

        .adm-vote-btns { display: flex; gap: 8px; }

        .adm-btn-approve {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 20px; background: var(--forest); color: white;
          border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .adm-btn-approve:hover:not(:disabled) { background: var(--mid); transform: translateY(-1px); }
        .adm-btn-approve:disabled { opacity: 0.55; cursor: not-allowed; }

        .adm-btn-reject {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 20px; background: var(--red-bg); color: var(--red);
          border: 1.5px solid var(--red-border); border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .adm-btn-reject:hover:not(:disabled) { background: #fee2e2; }
        .adm-btn-reject:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ✅ submitter name styling */
        .adm-submitter { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 5px; }
        .adm-submitter-avatar { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, var(--mid), var(--sprout)); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }

        .adm-img-loading { width: 100%; height: 100%; background: linear-gradient(90deg, var(--pale) 25%, #dff0e8 50%, var(--pale) 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
        @keyframes shimmer { to { background-position: -200% 0; } }

        @media (max-width: 768px) {
          .adm-page { padding: 24px 16px 60px; }
          .adm-card { grid-template-columns: 1fr; }
          .adm-card-img { height: 180px; }
          .adm-summary { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="adm-page">
        {/* Header */}
        <div className="adm-header">
          <div className="adm-title-block">
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
                {f === "ALL" ? "All Submissions" : f.charAt(0) + f.slice(1).toLowerCase()}
                <span className="adm-filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="adm-summary">
          {[
            { val: counts.ALL,      lbl: "Total Submissions" },
            { val: counts.PENDING,  lbl: "Awaiting Review" },
            { val: counts.APPROVED, lbl: "Approved" },
            { val: counts.REJECTED, lbl: "Rejected" },
          ].map((s, i) => (
            <div key={i} className="adm-sum-tile">
              <div className="adm-sum-val">{s.val}</div>
              <div className="adm-sum-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* List */}
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

              // ✅ FIX: images come from the dedicated /images endpoint via AdminLandDetail
              // For the list card thumbnail, use whatever the API returns on the land object
              const thumbUrl = land.images?.[0]?.imageUrl || land.imageUrls?.[0] || null;
              const imgCount = land.images?.length || land.imageUrls?.length || 0;

              // ✅ FIX: show submitter name not raw ID
              const submitterDisplay = land.createdByName || land.submittedByName
                || (land.createdBy ? `User #${land.createdBy}` : null)
                || (land.submittedBy ? `User #${land.submittedBy}` : null);

              const submitterInitial = (land.createdByName || land.submittedByName || "?")?.[0]?.toUpperCase();

              return (
                <motion.div key={land.id} className="adm-card" variants={cardVariants}>
                  {/* Image */}
                  <div className="adm-card-img">
                    {thumbUrl
                      ? (
                        <img
                          src={thumbUrl}
                          alt={land.title}
                          onError={e => { e.target.src = "https://via.placeholder.com/220x220/edf7f2/0b2e1a?text=🌿"; }}
                        />
                      )
                      : <div className="adm-img-placeholder">🌍</div>
                    }
                    {imgCount > 1 && <span className="adm-img-count">+{imgCount - 1} photos</span>}
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
                      {land.areaSqm && (
                        <span className="adm-meta-item">
                          <span className="adm-meta-icon">📐</span>
                          {(land.areaSqm / 10000).toFixed(2)} ha
                        </span>
                      )}
                      {land.ownerName && (
                        <span className="adm-meta-item">
                          <span className="adm-meta-icon">👤</span>
                          {land.ownerName}
                        </span>
                      )}
                      {land.ownerPhone && (
                        <span className="adm-meta-item">
                          <span className="adm-meta-icon">📞</span>
                          {land.ownerPhone}
                        </span>
                      )}
                      {land.createdAt && (
                        <span className="adm-meta-item">
                          <span className="adm-meta-icon">🗓</span>
                          {new Date(land.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                        </span>
                      )}
                      {land.waterAvailable && (
                        <span className="adm-meta-item">
                          <span className="adm-meta-icon">💧</span>
                          Water: {land.waterAvailable}
                        </span>
                      )}
                    </div>

                    {land.description && (
                      <p className="adm-desc">{land.description}</p>
                    )}

                    <div className="adm-tags">
                      {land.soilType       && <span className="adm-tag">🪨 {land.soilType}</span>}
                      {land.ownershipType  && <span className="adm-tag">🏷 {land.ownershipType}</span>}
                      {land.fencing !== undefined && <span className="adm-tag">{land.fencing ? "🔒 Fenced" : "⛓ No Fence"}</span>}
                      {land.accessRoad     && <span className="adm-tag">🛤 {land.accessRoad}</span>}
                      {land.landStatus     && <span className="adm-tag">📊 {land.landStatus}</span>}
                    </div>

                    <div className="adm-card-footer">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button className="adm-view-btn" onClick={() => setSelectedId(land.id)}>
                          🔍 View Full Details
                        </button>
                        {/* ✅ FIX: show submitter name with avatar initial */}
                        {submitterDisplay && (
                          <span className="adm-submitter">
                            <span className="adm-submitter-avatar">{submitterInitial}</span>
                            {submitterDisplay}
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

const styles = {
  guard: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh", gap: 12,
    fontFamily: "'DM Sans', sans-serif", color: "#3d5244",
    fontSize: 15,
  },
  guardIcon: { fontSize: 42 },
};