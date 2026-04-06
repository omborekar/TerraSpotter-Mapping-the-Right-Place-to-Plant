/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Admin panel for reviewing and approving pending land submissions.
 */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminLandDetail from "./AdminLandDetail";

const BASE_URL = import.meta.env.VITE_API_URL;

const STATUS = {
  PENDING:  { dot: "#f59e0b", text: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  label: "Pending" },
  APPROVED: { dot: "#4ade80", text: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)",  label: "Approved" },
  REJECTED: { dot: "#f87171", text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", label: "Rejected" },
};

/* ─── Bone ─── */
function Bone({ style = {} }) {
  return (
    <div style={{
      background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "adm-shimmer 1.4s infinite",
      borderRadius: 4,
      ...style,
    }} />
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      display: "grid",
      gridTemplateColumns: "180px 1fr",
      overflow: "hidden",
    }}>
      <Bone style={{ borderRadius: 0, minHeight: 160 }} />
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Bone style={{ height: 16, width: "55%" }} />
          <Bone style={{ height: 22, width: 80, borderRadius: 100 }} />
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Bone style={{ height: 12, width: 90 }} />
          <Bone style={{ height: 12, width: 110 }} />
          <Bone style={{ height: 12, width: 70 }} />
        </div>
        <Bone style={{ height: 12, width: "85%" }} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Bone style={{ height: 22, width: 70, borderRadius: 4 }} />
          <Bone style={{ height: 22, width: 80, borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Bone style={{ height: 32, width: 110, borderRadius: 6 }} />
            <Bone style={{ height: 32, width: 22, borderRadius: "50%" }} />
            <Bone style={{ height: 32, width: 80, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Bone style={{ height: 32, width: 90, borderRadius: 6 }} />
            <Bone style={{ height: 32, width: 80, borderRadius: 6 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CardImage ─── */
function CardImage({ landId }) {
  const [thumb, setThumb]   = useState(null);
  const [extra, setExtra]   = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    axios.get(`${BASE_URL}/api/lands/${landId}/images`, { withCredentials: true })
      .then(res => {
        const imgs = Array.isArray(res.data) ? res.data : [];
        if (imgs.length > 0) { setThumb(imgs[0].imageUrl); setExtra(imgs.length - 1); setStatus("loaded"); }
        else setStatus("empty");
      })
      .catch(() => setStatus("empty"));
  }, [landId]);

  const baseStyle = { width: "100%", height: "100%", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" };

  if (status === "loading") return (
    <div style={baseStyle}>
      <Bone style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
    </div>
  );

  if (status === "empty" || !thumb) return (
    <div style={{ ...baseStyle, flexDirection: "column", gap: 6, background: "rgba(255,255,255,0.02)" }}>
      <span style={{ fontSize: 28, opacity: 0.25 }}>🌍</span>
      <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>NO PHOTOS</span>
    </div>
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 160 }}>
      <img
        src={thumb} alt="land"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={e => { e.target.src = "https://via.placeholder.com/180x160/0d1f12/3d7a52?text=🌿"; }}
      />
      {extra > 0 && (
        <span style={{
          position: "absolute", bottom: 8, right: 8,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
          color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 100,
        }}>+{extra}</span>
      )}
    </div>
  );
}

/* ─── Main ─── */
export default function AdminPendingLands() {
  const [lands, setLands]               = useState([]);
  const [user, setUser]                 = useState(null);
  const [sessionLoading, setSessionLoad] = useState(true);
  const [landsLoading, setLandsLoading] = useState(false);
  const [voting, setVoting]             = useState({});
  const [selectedId, setSelectedId]     = useState(null);
  const [filter, setFilter]             = useState("ALL");

  useEffect(() => {
    axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true })
      .then(r => setUser(r.data)).catch(() => setUser(null)).finally(() => setSessionLoad(false));
  }, []);

  const fetchLands = useCallback(async () => {
    setLandsLoading(true);
    try {
      let res;
      try { res = await axios.get(`${BASE_URL}/api/lands`, { withCredentials: true }); }
      catch { res = await axios.get(`${BASE_URL}/api/lands/pending`, { withCredentials: true }); }
      setLands(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("fetchLands:", err); }
    finally { setLandsLoading(false); }
  }, []);

  useEffect(() => { if (user?.role === "ADMIN") fetchLands(); }, [user, fetchLands]);

  const handleVote = async (landId, vote) => {
    setVoting(v => ({ ...v, [landId]: vote }));
    try {
      await axios.post(`${BASE_URL}/lands/${landId}/verify`, null, { withCredentials: true, params: { vote, userId: user.id } });
      setLands(prev => prev.map(l => l.id === landId ? { ...l, status: vote === "APPROVE" ? "APPROVED" : "REJECTED" } : l));
      fetchLands();
    } catch { alert("Error processing vote. Please try again."); fetchLands(); }
    finally { setVoting(v => ({ ...v, [landId]: null })); }
  };

  /* ── Guards ── */
  if (sessionLoading) return (
    <div style={S.page}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Bone style={{ height: 10, width: 80 }} />
          <Bone style={{ height: 30, width: 220 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[...Array(4)].map((_, i) => <Bone key={i} style={{ height: 34, width: 90, borderRadius: 100 }} />)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <Bone key={i} style={{ height: 88, borderRadius: 8 }} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (!user?.role) return (
    <div style={S.guard}><span style={{ fontSize: 40 }}>🔒</span><p>No active session</p></div>
  );
  if (user.role !== "ADMIN") return (
    <div style={S.guard}><span style={{ fontSize: 40 }}>🚫</span><p>Access Denied — Admins only</p></div>
  );

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
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#0c0f0d; --surface:#131812; --surface2:#1a2019;
          --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
          --text:#e8f0eb; --muted:#6b7e71; --subtle:#3a4a3d;
          --green:#4ade80; --green2:#22c55e; --green-dim:#1a4d2e;
          --amber:#fbbf24; --red:#f87171;
          --mono:'JetBrains Mono',monospace;
        }
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;}
        @keyframes adm-shimmer{to{background-position:-200% 0;}}
        @keyframes adm-pulse-bar{
          0%{transform:translateX(-100%);}
          100%{transform:translateX(200%);}
        }
      `}</style>

      <div style={S.page}>
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)", letterSpacing: "0.2em", marginBottom: 8 }}>
              ADMIN / LAND_REVIEW_QUEUE
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
              Review Queue
            </h1>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => {
              const s = STATUS[f] || {};
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "7px 16px", borderRadius: 100,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                    background: isActive ? (f === "ALL" ? "rgba(74,222,128,0.15)" : s.bg) : "var(--surface)",
                    border: `1px solid ${isActive ? (f === "ALL" ? "rgba(74,222,128,0.3)" : s.border) : "var(--border)"}`,
                    color: isActive ? (f === "ALL" ? "var(--green)" : s.text) : "var(--muted)",
                  }}
                >
                  {f !== "ALL" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
                  {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
                    padding: "1px 6px", borderRadius: 4,
                    background: isActive ? "rgba(255,255,255,0.12)" : "var(--surface2)",
                    color: isActive ? "#fff" : "var(--muted)",
                  }}>
                    {counts[f]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Loading bar ── */}
        {landsLoading && (
          <div style={{ height: 2, background: "var(--surface2)", borderRadius: 1, marginBottom: 20, overflow: "hidden", position: "relative" }}>
            <div style={{
              position: "absolute", top: 0, bottom: 0, width: "60%",
              background: "linear-gradient(90deg, transparent, var(--green), transparent)",
              animation: "adm-pulse-bar 1.2s ease-in-out infinite",
            }} />
          </div>
        )}

        {/* ── Summary tiles ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { val: counts.ALL,      lbl: "Total",    color: "#fff",         border: "var(--border)" },
            { val: counts.PENDING,  lbl: "Pending",  color: "var(--amber)", border: "rgba(251,191,36,0.2)" },
            { val: counts.APPROVED, lbl: "Approved", color: "var(--green)", border: "rgba(74,222,128,0.2)" },
            { val: counts.REJECTED, lbl: "Rejected", color: "var(--red)",   border: "rgba(248,113,113,0.2)" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--surface)", border: `1px solid ${s.border}`,
              borderRadius: 8, padding: "16px 20px",
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, lineHeight: 1, color: s.color }}>{s.val}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", color: "var(--muted)", marginTop: 6, textTransform: "uppercase" }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* ── Cards ── */}
        {landsLoading && lands.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.3 }}>📭</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--subtle)", marginBottom: 6 }}>
              Queue empty
            </div>
            <p style={{ fontSize: 13 }}>No {filter !== "ALL" ? filter.toLowerCase() + " " : ""}submissions found.</p>
          </div>
        ) : (
          <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {filtered.map(land => {
              const st = STATUS[land.status] || STATUS.PENDING;
              const isVoting = voting[land.id];
              const submitterName =
                land.createdByName || land.submittedByName ||
                (land.createdBy ? `User #${land.createdBy}` : null) ||
                (land.submittedBy ? `User #${land.submittedBy}` : null);

              return (
                <motion.div
                  key={land.id}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 10, overflow: "hidden",
                    display: "grid", gridTemplateColumns: "180px 1fr",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38 } } }}
                >
                  {/* Image */}
                  <div style={{ position: "relative", overflow: "hidden", background: "var(--surface2)" }}>
                    <CardImage landId={land.id} />
                    {land.status === "APPROVED" && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(74,222,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--green)", letterSpacing: "0.12em" }}>✓ APPROVED</span>
                      </div>
                    )}
                    {land.status === "REJECTED" && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(248,113,113,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--red)", letterSpacing: "0.12em" }}>✕ REJECTED</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Title + badge */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                        {land.title || "Untitled Land"}
                      </h2>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                        background: st.bg, color: st.text, border: `1px solid ${st.border}`, flexShrink: 0,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot }} />
                        {st.label}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                      {land.areaSqm    && <span>⬛ {(land.areaSqm / 10000).toFixed(2)} ha</span>}
                      {land.ownerName  && <span>👤 {land.ownerName}</span>}
                      {land.ownerPhone && <span>📞 {land.ownerPhone}</span>}
                      {land.createdAt  && <span>🗓 {new Date(land.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                      {land.waterAvailable && <span>💧 {land.waterAvailable}</span>}
                    </div>

                    {/* Description */}
                    {land.description && (
                      <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {land.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {land.soilType      && <Tag>{land.soilType}</Tag>}
                      {land.ownershipType && <Tag>{land.ownershipType}</Tag>}
                      {land.fencing !== undefined && <Tag>{land.fencing ? "Fenced" : "No Fence"}</Tag>}
                      {land.accessRoad    && <Tag>{land.accessRoad}</Tag>}
                      {land.landStatus    && <Tag>{land.landStatus}</Tag>}
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => setSelectedId(land.id)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "7px 14px", background: "var(--surface2)", border: "1px solid var(--border2)",
                            borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text)",
                            cursor: "pointer", transition: "all 0.2s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,222,128,0.08)"; e.currentTarget.style.borderColor = "rgba(74,222,128,0.25)"; e.currentTarget.style.color = "var(--green)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
                        >
                          ↗ Full Detail
                        </button>
                        {submitterName && (
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #1a4d2e, #22c55e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                              {(submitterName)?.[0]?.toUpperCase()}
                            </span>
                            {submitterName}
                          </span>
                        )}
                      </div>

                      {land.status === "PENDING" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleVote(land.id, "APPROVE")}
                            disabled={!!isVoting}
                            style={{
                              padding: "7px 16px", background: isVoting ? "var(--green-dim)" : "rgba(74,222,128,0.12)",
                              border: "1px solid rgba(74,222,128,0.3)", borderRadius: 6,
                              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                              color: "var(--green)", cursor: isVoting ? "not-allowed" : "pointer",
                              opacity: isVoting ? 0.6 : 1, transition: "all 0.2s",
                            }}
                          >
                            {isVoting === "APPROVE" ? "⏳ …" : "✓ Approve"}
                          </button>
                          <button
                            onClick={() => handleVote(land.id, "REJECT")}
                            disabled={!!isVoting}
                            style={{
                              padding: "7px 14px", background: "rgba(248,113,113,0.06)",
                              border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6,
                              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                              color: "var(--red)", cursor: isVoting ? "not-allowed" : "pointer",
                              opacity: isVoting ? 0.6 : 1, transition: "all 0.2s",
                            }}
                          >
                            {isVoting === "REJECT" ? "⏳ …" : "✕ Reject"}
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

function Tag({ children }) {
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500,
      padding: "3px 9px", background: "rgba(255,255,255,0.04)",
      border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 4,
    }}>
      {children}
    </span>
  );
}

const S = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "36px 32px 80px",
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
  },
  guard: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh", gap: 12,
    fontFamily: "'DM Sans', sans-serif", color: "#6b7e71", fontSize: 15,
  },
};