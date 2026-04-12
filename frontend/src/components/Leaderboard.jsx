/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Public leaderboard page — shows top users ranked by XP with level, streak, and badge count.
*/
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "./ui/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;

const LEVEL_LABELS = [
  "", "Seedling", "Sprout", "Sapling", "Grove Keeper", "Forest Guard",
  "Eco Warrior", "Tree Sage", "Nature Warden", "Biome Master", "Eco Legend",
];

function getLevelLabel(lv) {
  return LEVEL_LABELS[Math.min(lv, LEVEL_LABELS.length - 1)] || `Level ${lv}`;
}

function getRankStyle(rank) {
  if (rank === 1) return { bg: "linear-gradient(135deg, #ffd700, #b8860b)", color: "#7a5c00", emoji: "🥇" };
  if (rank === 2) return { bg: "linear-gradient(135deg, #e8e8e8, #adb5bd)", color: "#444", emoji: "🥈" };
  if (rank === 3) return { bg: "linear-gradient(135deg, #cd7f32, #a0522d)", color: "#fff", emoji: "🥉" };
  return { bg: "rgba(255,255,255,0.06)", color: "#fff", emoji: `#${rank}` };
}

function XpBar({ xp, level, maxXp }) {
  const xpPerLevel = 300;
  const xpInLevel = xp - (level - 1) * xpPerLevel;
  const pct = Math.min(100, Math.round((xpInLevel / xpPerLevel) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div style={{
        flex: 1, height: 6, borderRadius: 6,
        background: "rgba(255,255,255,0.12)", overflow: "hidden",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%", borderRadius: 6,
            background: "linear-gradient(90deg, #4db87a, #2d9e5c)",
            boxShadow: "0 0 6px rgba(77,184,122,0.6)",
          }}
        />
      </div>
      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", minWidth: 42 }}>
        {pct}%
      </span>
    </div>
  );
}

function LeaderCard({ row, index, currentUserId }) {
  const rs = getRankStyle(row.rank);
  const isMe = row.userId === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 20px",
        borderRadius: 16,
        background: isMe
          ? "linear-gradient(135deg, rgba(77,184,122,0.14), rgba(45,110,62,0.1))"
          : "rgba(255,255,255,0.045)",
        border: isMe ? "1.5px solid rgba(77,184,122,0.35)" : "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(6px)",
        transition: "background 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* You indicator */}
      {isMe && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: "rgba(77,184,122,0.9)",
          fontSize: 9, fontWeight: 700, color: "#fff",
          padding: "2px 8px", borderRadius: "0 16px 0 8px",
          letterSpacing: 1.2, textTransform: "uppercase",
        }}>YOU</div>
      )}

      {/* Rank badge */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: rs.bg, color: rs.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: row.rank <= 3 ? 18 : 14,
        boxShadow: row.rank <= 3 ? "0 4px 14px rgba(0,0,0,0.3)" : "none",
      }}>
        {rs.emoji}
      </div>

      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #163d25, #3a8c57)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: "#fff",
        boxShadow: "0 2px 10px rgba(58,140,87,0.28)",
        border: "2px solid rgba(77,184,122,0.25)",
        textTransform: "uppercase",
      }}>
        {row.initials}
      </div>

      {/* Name + bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 14.5, fontWeight: 600, color: "#fff",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            fontFamily: "'Outfit', sans-serif",
          }}>
            {row.name}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#4db87a",
            background: "rgba(77,184,122,0.15)",
            padding: "2px 7px", borderRadius: 100,
            border: "1px solid rgba(77,184,122,0.2)",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Lv {row.level} · {getLevelLabel(row.level)}
          </span>
        </div>
        <XpBar xp={row.totalXp} level={row.level} />
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#4db87a", lineHeight: 1, fontFamily: "'Outfit',sans-serif" }}>
            {row.totalXp.toLocaleString()}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>XP</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", lineHeight: 1, fontFamily: "'Outfit',sans-serif" }}>
            {row.badgeCount}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Badges</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fb923c", lineHeight: 1, fontFamily: "'Outfit',sans-serif" }}>
            {row.streak > 0 ? `🔥${row.streak}` : "—"}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Streak</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [board, setBoard]   = useState([]);
  const [myId,   setMyId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRank,  setMyRank]  = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [lbRes, meRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/gamification/leaderboard?limit=20`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/gamification/me`,                   { withCredentials: true }),
        ]);

        if (lbRes.status === "fulfilled") setBoard(lbRes.value.data);
        if (meRes.status === "fulfilled") {
          const { rank } = meRes.value.data;
          setMyRank(rank);
        }

        // Try to get userId from session
        try {
          const session = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true });
          setMyId(session.data?.id);
        } catch { /* not logged in */ }

      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner text="Loading leaderboard…" />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #071408 0%, #0c1e11 40%, #0a1a0d 100%)",
      padding: "48px 16px 80px",
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Cormorant+Garant:wght@600;700&display=swap');`}</style>

      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          {/* Glow pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(77,184,122,0.12)", border: "1px solid rgba(77,184,122,0.25)",
            borderRadius: 100, padding: "6px 18px", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>🏆</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4db87a", letterSpacing: 2, textTransform: "uppercase" }}>
              TerraSpotter Rankings
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garant', serif",
            fontSize: "clamp(36px, 6vw, 58px)",
            fontWeight: 700, color: "#fff",
            lineHeight: 1.1, marginBottom: 14,
          }}>
            Community&nbsp;
            <span style={{ color: "#4db87a" }}>Leaderboard</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto" }}>
            Top environmental champions ranked by XP earned through land submissions,
            plantations, reviews, and community action.
          </p>

          {myRank && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: 24, display: "inline-flex", alignItems: "center", gap: 10,
                background: "rgba(77,184,122,0.1)", border: "1px solid rgba(77,184,122,0.25)",
                borderRadius: 100, padding: "8px 20px",
              }}
            >
              <span style={{ fontSize: 16 }}>📍</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                Your current rank: <strong style={{ color: "#4db87a" }}>#{myRank}</strong>
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Podium highlights */}
        {board.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, marginBottom: 40 }}
          >
            {/* 2nd */}
            <PodiumBlock row={board[1]} height={100} delay={0.2} />
            {/* 1st */}
            <PodiumBlock row={board[0]} height={130} delay={0.1} crown />
            {/* 3rd */}
            <PodiumBlock row={board[2]} height={80} delay={0.3} />
          </motion.div>
        )}

        {/* Full leaderboard (skip top 3 since shown in podium) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {board.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "60px 0", fontSize: 14 }}>
              No rankings yet — start contributing to earn XP!
            </div>
          ) : (
            board.map((row, i) => (
              <LeaderCard key={row.userId} row={row} index={i} currentUserId={myId} />
            ))
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link to="/profile" style={{
            color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

function PodiumBlock({ row, height, delay, crown = false }) {
  const rs = getRankStyle(row.rank);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, maxWidth: 200 }}
    >
      {crown && <span style={{ fontSize: 24, marginBottom: 4 }}>👑</span>}
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: "linear-gradient(135deg, #163d25, #3a8c57)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: "#fff", textTransform: "uppercase",
        border: "2px solid rgba(77,184,122,0.4)",
        boxShadow: "0 4px 16px rgba(58,140,87,0.3)",
      }}>
        {row.initials}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{row.name}</p>
        <p style={{ fontSize: 11.5, color: "#4db87a", fontWeight: 700 }}>{row.totalXp.toLocaleString()} XP</p>
      </div>
      <div style={{
        width: "100%", height, background: rs.bg,
        borderRadius: "10px 10px 0 0",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 10, fontSize: crown ? 26 : 22,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
      }}>
        {rs.emoji}
      </div>
    </motion.div>
  );
}
