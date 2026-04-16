import { useTranslation } from "react-i18next";
/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: XpToast — animated overlay toast shown when a user earns XP or a new badge.
*/
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Usage:
 *   <XpToast xp={200} action="Plantation Completed!" badges={["Tree Warrior"]} levelUp={5} />
 *
 * Pass null/undefined to hide the toast. The parent is responsible for clearing
 * the toast state after `duration` ms.
 */
export default function XpToast({ xp, action, badges = [], levelUp = null, onDismiss }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!xp) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 4000);
    return () => clearTimeout(t);
  }, [xp, action]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {/* Main XP card */}
          <div
            style={{
              background: "linear-gradient(135deg, #0c1e11, #163d25)",
              borderRadius: 20,
              padding: "16px 22px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 12px 40px rgba(12,30,17,0.55), 0 0 0 1px rgba(77,184,122,0.18)",
              minWidth: 260,
            }}
          >
            {/* XP burst ring */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
              style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: "radial-gradient(circle, #4db87a 0%, #2d6e3e 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 0 4px rgba(77,184,122,0.2)",
                fontSize: 22,
              }}
            >
              ⚡
            </motion.div>

            <div style={{ flex: 1 }}>
              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                style={{ color: "#4db87a", fontSize: 22, fontWeight: 700, lineHeight: 1, marginBottom: 3 }}
              >
                +{xp} XP
              </motion.p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, fontWeight: 400 }}>
                {action}
              </p>
            </div>
          </div>

          {/* Level-up card */}
          {levelUp && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                background: "linear-gradient(135deg, #b8860b, #daa520)",
                borderRadius: 14,
                padding: "10px 18px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 8px 28px rgba(184,134,11,0.4)",
              }}
            >
              <span style={{ fontSize: 18 }}>🎉</span>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                Level Up — You're now Level {levelUp}!
              </p>
            </motion.div>
          )}

          {/* Badge cards */}
          {badges.map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              style={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: 14,
                padding: "10px 18px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              }}
            >
              <span style={{ fontSize: 18 }}>🏅</span>
              <div>
                <p style={{ color: "#0c1e11", fontSize: 12, fontWeight: 700 }}>{t("auto.auto_382", "Badge Unlocked!")}</p>
                <p style={{ color: "#4db87a", fontSize: 13, fontWeight: 600 }}>{badge}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
