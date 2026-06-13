/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Leaderboard page — dark-first Tailwind, inline styles replaced.
*/
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";

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

function XpBar({ xp, level }) {
  const xpPerLevel = 300;
  const xpInLevel = xp - (level - 1) * xpPerLevel;
  const pct = Math.min(100, Math.round((xpInLevel / xpPerLevel) * 100));
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-white/12 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 shadow-sm shadow-primary/60" />
      </div>
      <span className="text-[10.5px] text-white/40 whitespace-nowrap min-w-[36px]">{pct}%</span>
    </div>
  );
}

function LeaderCard({ row, index, currentUserId }) {
  const { t } = useTranslation();
  const rs = getRankStyle(row.rank);
  const isMe = row.userId === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl relative overflow-hidden transition-colors border ${
        isMe
          ? "bg-primary/14 border-primary/35"
          : "bg-white/[0.045] border-white/[0.07] hover:bg-white/[0.07]"
      }`}
      style={{ backdropFilter: "blur(6px)" }}
    >
      {isMe && (
        <div className="absolute top-0 right-0 bg-primary/90 text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-2xl tracking-[1.2px] uppercase">
          {t("auto.auto_199", "YOU")}
        </div>
      )}

      {/* Rank badge */}
      <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-[14px]"
        style={{ background: rs.bg, color: rs.color, boxShadow: row.rank <= 3 ? "0 4px 14px rgba(0,0,0,0.3)" : "none", fontSize: row.rank <= 3 ? 18 : 14 }}>
        {rs.emoji}
      </div>

      {/* Avatar */}
      <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-emerald-800 to-primary flex items-center justify-center text-[13px] font-bold text-white uppercase border-2 border-primary/25 shadow-md">
        {row.initials}
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14.5px] font-semibold text-white truncate">{row.name}</span>
          <span className="text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full border border-primary/20 whitespace-nowrap shrink-0">
            Lv {row.level} · {getLevelLabel(row.level)}
          </span>
        </div>
        <XpBar xp={row.totalXp} level={row.level} />
      </div>

      {/* Stats */}
      <div className="flex gap-5 shrink-0">
        <div className="text-right">
          <p className="text-[18px] font-bold text-primary leading-none">{row.totalXp.toLocaleString()}</p>
          <p className="text-[10px] text-white/35 mt-0.5">{t("auto.auto_200", "XP")}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[18px] font-bold text-amber-400 leading-none">{row.badgeCount}</p>
          <p className="text-[10px] text-white/35 mt-0.5">{t("auto.auto_201", "Badges")}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[16px] font-bold text-orange-400 leading-none">{row.streak > 0 ? `🔥${row.streak}` : "—"}</p>
          <p className="text-[10px] text-white/35 mt-0.5">{t("auto.auto_202", "Streak")}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PodiumBlock({ row, height, delay, crown = false }) {
  const rs = getRankStyle(row.rank);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
      {crown && <span className="text-2xl mb-1">👑</span>}
      <div className="w-13 h-13 rounded-full bg-gradient-to-br from-emerald-800 to-primary flex items-center justify-center text-[14px] font-bold text-white uppercase border-2 border-primary/40 shadow-lg shadow-primary/30">
        {row.initials}
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-white mb-0.5">{row.name}</p>
        <p className="text-[11.5px] text-primary font-bold">{row.totalXp.toLocaleString()} XP</p>
      </div>
      <div className="w-full flex items-start justify-center pt-2.5 text-[20px] sm:text-[26px] rounded-t-[10px]"
        style={{ height, background: rs.bg, boxShadow: "0 -4px 20px rgba(0,0,0,0.2)", fontSize: crown ? 26 : 22 }}>
        {rs.emoji}
      </div>
    </motion.div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071408] via-[#0c1e11] to-[#0a1a0d] py-12 px-4">
      <div className="max-w-[780px] mx-auto flex flex-col gap-2.5">
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="h-8 w-32 rounded-full bg-white/5 animate-pulse" />
          <div className="h-12 w-80 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-4 w-64 rounded bg-white/5 animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-white/8" />
            <div className="w-11 h-11 rounded-full bg-white/8 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-32 rounded bg-white/8" />
              <div className="h-1.5 w-full rounded-full bg-white/8" />
            </div>
            <div className="hidden sm:flex gap-5">
              <div className="h-6 w-10 rounded bg-white/8" />
              <div className="h-6 w-8 rounded bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const [board, setBoard]   = useState([]);
  const [myId,   setMyId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank]   = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [lbRes, meRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/gamification/leaderboard?limit=20`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/gamification/me`, { withCredentials: true }),
        ]);
        if (lbRes.status === "fulfilled") setBoard(lbRes.value.data);
        if (meRes.status === "fulfilled") setMyRank(meRes.value.data?.rank);
        try {
          const session = await axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true });
          setMyId(session.data?.id);
        } catch {}
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <LeaderboardSkeleton />;

  return (
    <>
      <Helmet>
        <title>Leaderboard — TerraSpotter</title>
        <meta name="description" content="Top environmental champions ranked by XP." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#071408] via-[#0c1e11] to-[#0a1a0d] py-12 px-4 pb-20">
        <div className="max-w-[780px] mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/12 border border-primary/25 rounded-full px-4 py-1.5 mb-5">
              <span className="text-base">🏆</span>
              <span className="text-[11px] font-bold text-primary tracking-[2px] uppercase">
                {t("auto.auto_204", "TerraSpotter Rankings")}
              </span>
            </div>
            <h1 className="text-[clamp(36px,6vw,58px)] font-bold text-white leading-tight mb-3.5">
              {t("auto.auto_205", "Community ")}<span className="text-primary">{t("auto.auto_206", "Leaderboard")}</span>
            </h1>
            <p className="text-[15px] text-white/45 max-w-[480px] mx-auto">
              {t("auto.auto_207", "Top environmental champions ranked by XP earned through land submissions, plantations, reviews, and community action.")}
            </p>
            {myRank && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                className="mt-6 inline-flex items-center gap-2.5 bg-primary/10 border border-primary/25 rounded-full px-5 py-2">
                <span className="text-base">📍</span>
                <span className="text-[13px] text-white/70">
                  {t("auto.auto_208", "Your current rank:")} <strong className="text-primary">#{myRank}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Podium */}
          {board.length >= 3 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
              className="flex justify-center items-end gap-4 mb-10">
              <PodiumBlock row={board[1]} height={100} delay={0.2} />
              <PodiumBlock row={board[0]} height={130} delay={0.1} crown />
              <PodiumBlock row={board[2]} height={80}  delay={0.3} />
            </motion.div>
          )}

          {/* Full list */}
          <div className="flex flex-col gap-2.5">
            {board.length === 0 ? (
              <div className="text-center text-white/30 py-16 text-[14px]">
                {t("auto.auto_209", "No rankings yet — start contributing to earn XP!")}
              </div>
            ) : (
              board.map((row, i) => <LeaderCard key={row.userId} row={row} index={i} currentUserId={myId} />)
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/profile" className="text-white/40 text-[13px] inline-flex items-center gap-1.5 hover:text-white/70 transition-colors">
              {t("auto.auto_210", "← Back to Profile")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
