/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Main land submission form — map modal redesigned with better tiles, GPS, draw UX.
*/
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { useTranslation } from "react-i18next";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Skeleton shimmer ─────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`rounded-xl bg-gradient-to-r from-[#f0ebe2] via-[#e8e2d8] to-[#f0ebe2] animate-pulse ${className}`} />
);

// ─── Page skeleton ────────────────────────────────────────────
const PageSkeleton = () => (
  <div className="min-h-screen bg-[#f7f3ec] flex flex-col lg:flex-row font-['Outfit',sans-serif]">
    <div className="hidden lg:flex flex-col w-80 xl:w-96 bg-[#0c1e11] p-10 gap-8 shrink-0">
      <div className="flex items-center gap-3">
        <Sk className="w-9 h-9 rounded-xl bg-white/10" />
        <Sk className="h-6 w-32 bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/8 flex flex-col gap-2">
            <Sk className="h-7 w-12 bg-white/10" />
            <Sk className="h-3 w-16 bg-white/6" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex-1 p-6 sm:p-10 flex flex-col gap-6 max-w-3xl">
      <Sk className="h-10 w-72 max-w-full" />
      <Sk className="h-4 w-80 max-w-full" />
      <Sk className="h-14 w-full rounded-2xl" />
      <Sk className="h-64 w-full rounded-3xl" />
    </div>
  </div>
);

// ─── Form helpers ─────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[0.9px] font-['Outfit',sans-serif]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-600 font-medium mt-0.5 font-['Outfit',sans-serif]">{error}</p>}
  </div>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-4 pb-5 border-b border-[#ede8de]">
    <span className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0 border border-emerald-100">
      {icon}
    </span>
    <div>
      <h3 className="font-['Cormorant_Garant',serif] text-[20px] font-semibold text-[#0c1e11] leading-tight">{title}</h3>
      {subtitle && <p className="text-sm text-[#8a7d6e] mt-1 leading-relaxed font-['Outfit',sans-serif] font-light">{subtitle}</p>}
    </div>
  </div>
);

const ic = (err) =>
  `w-full px-4 py-3 border-[1.5px] rounded-xl text-sm text-[#0c1e11] bg-white outline-none
   transition-all duration-200 font-['Outfit',sans-serif]
   ${err
    ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
    : "border-[#e0d8cf] hover:border-[#c8bfb4] focus:border-[#4db87a] focus:ring-2 focus:ring-[#4db87a]/10 focus:bg-[#fdfffe]"}`;

const sc = (err) => ic(err) + " cursor-pointer appearance-none";

const ToggleBtn = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full border-[1.5px] text-sm font-medium transition-all duration-150 cursor-pointer font-['Outfit',sans-serif]
      ${selected
        ? "bg-[#0c1e11] border-transparent text-white shadow-md"
        : "border-[#e0d8cf] bg-white text-[#8a7d6e] hover:border-[#4db87a]/50 hover:text-[#0c1e11] hover:bg-emerald-50"}`}
  >
    {label}
  </button>
);

const BtnPrimary = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0c1e11] text-white text-sm font-semibold font-['Outfit',sans-serif] shadow-[0_4px_16px_rgba(12,30,17,0.2)] hover:bg-[#163d25] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer whitespace-nowrap"
  >
    {children}
  </button>
);

const BtnSecondary = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-5 py-3 rounded-xl border-[1.5px] border-[#e0d8cf] bg-white text-[#8a7d6e] text-sm font-medium font-['Outfit',sans-serif] hover:border-[#0c1e11] hover:text-[#0c1e11] hover:bg-emerald-50 transition-all duration-150 cursor-pointer"
  >
    {children}
  </button>
);

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

const StepBadge = ({ n, active, done }) => (
  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-[1.5px] shrink-0 font-['Outfit',sans-serif]
    ${done ? "bg-[#4db87a] border-[#4db87a] text-white shadow-sm"
      : active ? "bg-white border-white text-[#0c1e11]"
        : "border-current"}`}>
    {done ? "✓" : n}
  </span>
);

// ─── GPS Icon SVG ─────────────────────────────────────────────
const GpsIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="8" strokeDasharray="2 2" opacity="0.4" />
  </svg>
);

// ─── Draw Guide Icon ──────────────────────────────────────────
const PolygonIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="currentColor" fillOpacity="0.12" />
    <circle cx="12" cy="2" r="1.5" fill="currentColor" />
    <circle cx="22" cy="8.5" r="1.5" fill="currentColor" />
    <circle cx="22" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="22" r="1.5" fill="currentColor" />
    <circle cx="2" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="2" cy="8.5" r="1.5" fill="currentColor" />
  </svg>
);

// ─── Sidebar content ──────────────────────────────────────────
const SidebarContent = ({ compact = false, dbStats }) => {
  const { t } = useTranslation();
  const formatNum = (num) => {
    if (!num) return "0";
    return num > 999 ? (num / 1000).toFixed(1) + "k" : String(num);
  };
  const stats = [
    { num: dbStats ? formatNum(dbStats.totalLands) : "…", label: "Lands Mapped" },
    { num: dbStats ? formatNum(dbStats.treesPlanted) : "…", label: "Trees Planted" },
    { num: dbStats ? formatNum(dbStats.volunteers) : "…", label: "Volunteers" },
    { num: dbStats ? (dbStats.treesPlanted * 0.021).toFixed(1) + "t" : "…", label: "CO₂ Captured" },
  ];
  const impact = [
    ["Micro-climate restoration", "Even small plantations reduce surface temperature by 2–4°C in surrounding areas."],
    ["Groundwater recharge", "Native trees improve aquifer levels and reduce surface runoff on barren land."],
    ["Decades of carbon capture", "Verified species selections sequester carbon continuously — not just seasonally."],
  ];
  const process = [
    "Boundary verified against satellite imagery",
    "Soil, rainfall, and climate data fetched via APIs",
    "Native tree species recommended by density",
    "Land matched with local volunteers or NGOs",
  ];

  return (
    <div className="flex flex-col gap-7 relative z-10">
      {!compact && (
        <div>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-gradient-to-br from-[#2d6e3e] to-[#4db87a] shadow-[0_2px_12px_rgba(77,184,122,0.35)]">
              🌿
            </span>
            <span className="font-['Cormorant_Garant',serif] text-white text-2xl font-semibold tracking-tight">
              {t("auto.auto_211", "Terra")}<span className="text-[#4db87a]">{t("auto.auto_212", "Spotter")}</span>
            </span>
          </div>
          <p className="text-white/30 text-[10px] tracking-[2px] uppercase mt-1.5 ml-12 font-['Outfit',sans-serif]">
            {t("auto.auto_213", "Land for Green Futures")}
          </p>
        </div>
      )}

      <div className={`grid gap-2.5 ${compact ? "grid-cols-4" : "grid-cols-2"}`}>
        {stats.map(s => (
          <div key={s.label} className="bg-white/[0.06] rounded-xl p-3.5 border border-white/[0.09] hover:bg-white/[0.10] hover:border-[#4db87a]/25 transition-all duration-200 group">
            <div className={`font-['Cormorant_Garant',serif] text-[#4db87a] font-semibold leading-none mb-1 group-hover:text-[#6dd49a] transition-colors ${compact ? "text-xl" : "text-2xl"}`}>
              {s.num}
            </div>
            <div className="text-white/35 text-[10px] uppercase tracking-[1.1px] font-medium font-['Outfit',sans-serif]">{s.label}</div>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="flex flex-col gap-5">
          {impact.map(([h, p]) => (
            <div key={h} className="border-l-2 border-[#4db87a]/40 pl-4 hover:border-[#4db87a] transition-colors">
              <h4 className="text-white text-[13px] font-semibold mb-1 font-['Outfit',sans-serif]">{h}</h4>
              <p className="text-white/45 text-xs leading-relaxed font-['Outfit',sans-serif] font-light">{p}</p>
            </div>
          ))}
        </div>
      )}

      <div className={compact ? "" : "border-t border-white/[0.08] pt-6"}>
        {!compact && (
          <p className="text-white/30 text-[10px] uppercase tracking-[2px] font-semibold mb-4 font-['Outfit',sans-serif]">{t("auto.auto_214", "What happens next")}</p>
        )}
        <ol className={`flex flex-col gap-2.5 ${compact ? "hidden sm:flex" : ""}`}>
          {process.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-white/50 leading-relaxed font-['Outfit',sans-serif] font-light">
              <span className="w-5 h-5 rounded-full bg-[#4db87a]/15 text-[#4db87a] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-['Outfit',sans-serif]">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────
const Main = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [mapOpen, setMapOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState("satellite"); // "satellite" | "terrain" | "street"
  const [locatingGps, setLocatingGps] = useState(false);
  const mapRef = useRef(null);
  const locationLayerRef = useRef(null);

  const [polygonCoords, setPolygonCoords] = useState(null);
  const [centroid, setCentroid] = useState(null);
  const [areaSqm, setAreaSqm] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState({ name: "", phone: "", email: "", ownershipType: "", permission: "" });
  const [land, setLand] = useState({
    status: "", accessRoad: "", waterAvailable: "",
    waterFrequency: "", fencing: "No", soilType: "", nearbyLandmark: "", notes: "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true }).catch(() => null),
      axios.get(`${BASE_URL}/api/stats`).catch(() => null),
    ]).then(([authRes, statsRes]) => {
      if (authRes?.data) setUser(authRes.data);
      if (statsRes?.data) setDbStats(statsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mapOpen && mapRef.current) setTimeout(() => mapRef.current.invalidateSize(), 300);
  }, [mapOpen]);

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const locateUser = () => {
    if (!mapRef.current) return;
    setLocatingGps(true);
    mapRef.current.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
    mapRef.current.once("locationfound", e => {
      setLocatingGps(false);
      if (locationLayerRef.current) mapRef.current.removeLayer(locationLayerRef.current);

      // Custom pulsing GPS marker
      const gpsDotIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:18px;height:18px;border-radius:50%;
          background:#4db87a;border:3px solid white;
          box-shadow:0 0 0 6px rgba(77,184,122,0.25),0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      locationLayerRef.current = L.layerGroup([
        L.marker(e.latlng, { icon: gpsDotIcon }),
        L.circle(e.latlng, {
          radius: e.accuracy,
          color: "#4db87a",
          fillColor: "#4db87a",
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: "4 4",
        }),
      ]).addTo(mapRef.current);
    });
    mapRef.current.once("locationerror", () => {
      setLocatingGps(false);
      alert("Location access denied. Please enable GPS in your browser.");
    });
  };

  const onPolygonCreated = (e) => {
    const latlngs = e.layer.getLatLngs()[0];
    setPolygonCoords(latlngs.map(p => ({ lat: p.lat, lng: p.lng })));
    setAreaSqm(L.GeometryUtil.geodesicArea(latlngs).toFixed(2));
    const lat = latlngs.reduce((s, p) => s + p.lat, 0) / latlngs.length;
    const lng = latlngs.reduce((s, p) => s + p.lng, 0) / latlngs.length;
    setCentroid({ lat, lng });
    mapRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
  };

  const handleFileChange = (e) => setFiles([...e.target.files]);
  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const validateStep = (s) => {
    const e = {};
    if (s === 1 && !polygonCoords) e.polygon = "Please draw the land boundary on the map";
    if (s === 2) {
      if (!owner.name.trim()) e.ownerName = "Owner name is required";
      if (!owner.phone.trim()) e.ownerPhone = "Phone number is required";
      if (!owner.ownershipType) e.ownershipType = "Select ownership type";
      if (!owner.permission) e.permission = "Select permission status";
    }
    if (s === 3) {
      if (!land.status) e.landStatus = "Select land status";
      if (!land.waterAvailable) e.waterAvailable = "Select water availability";
      if (!land.waterFrequency) e.waterFrequency = "Select water frequency";
    }
    if (s === 4 && files.length < 3) e.files = "Upload at least 3 photos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const resetForm = () => {
    setSubmitted(false); setStep(1); setPolygonCoords(null);
    setAreaSqm(null); setFiles([]); setTitle(""); setDescription("");
  };

  const submitLand = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title || "Land Entry", description,
        polygonCoords: JSON.stringify(polygonCoords), centroid, areaSqm, owner, land,
      };
      const res = await axios.post(`${BASE_URL}/api/lands`, payload, { withCredentials: true });
      const landId = res.data.id;
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));
      await axios.post(`${BASE_URL}/api/lands/${landId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrors({ api: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton />;

  // Map tile sources
  const tileLayers = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri World Imagery",
      label: "Satellite",
      icon: "🛰️",
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "© OpenTopoMap contributors",
      label: "Terrain",
      icon: "🏔️",
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      label: "Street",
      icon: "🗺️",
    },
  };

  const steps = [
    { n: 1, label: "Boundary" },
    { n: 2, label: "Owner" },
    { n: 3, label: "Details" },
    { n: 4, label: "Photos" },
  ];

  const cardMotion = {
    initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 }, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <>
      <Helmet>
        <title>{t("auto.auto_215", "TerraSpotter — Submit Land")}</title>
        <meta name="description" content="Submit a land parcel for afforestation: draw boundary, upload photos, add details." />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23b5ac9e' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
            padding-right: 38px;
          }
          /* Leaflet draw toolbar polish */
          .leaflet-draw-toolbar a {
            background-color: #0c1e11 !important;
            border-color: rgba(77,184,122,0.25) !important;
          }
          .leaflet-draw-toolbar a:hover {
            background-color: #163d25 !important;
          }
          .leaflet-draw-toolbar .leaflet-draw-draw-polygon {
            background-image: none !important;
          }
          .leaflet-bar a {
            background-color: #0c1e11 !important;
            color: #4db87a !important;
            border-color: rgba(77,184,122,0.2) !important;
            font-weight: 700 !important;
          }
          .leaflet-bar a:hover {
            background-color: #163d25 !important;
          }
          .leaflet-draw-actions a {
            background-color: #0c1e11 !important;
            color: #e8f0eb !important;
            font-family: 'Outfit', sans-serif !important;
            font-size: 12px !important;
            font-weight: 600 !important;
          }
          .leaflet-draw-section { background: transparent !important; }
        `}</style>
      </Helmet>

      {/* ── SUCCESS OVERLAY ── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetForm}
          >
            <motion.div
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-[#ede8de]"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1 bg-gradient-to-r from-[#0c1e11] via-[#4db87a] to-[#0c1e11]" />
              <div className="p-8 flex gap-5 items-start">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg bg-gradient-to-br from-[#2d6e3e] to-[#0c1e11]"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.18, type: "spring", bounce: 0.5 }}
                >
                  🌱
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-['Cormorant_Garant',serif] text-2xl font-semibold text-[#0c1e11] mb-2">
                    {t("auto.auto_216", "Land Submitted!")}
                  </h2>
                  <p className="text-sm text-[#8a7d6e] leading-relaxed mb-5 font-['Outfit',sans-serif] font-light">
                    {t("auto.auto_217", "Thanks for your contribution. Every boundary drawn brings India closer to a greener future 🌿")}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <BtnSecondary onClick={resetForm}>{t("auto.auto_218", "Close")}</BtnSecondary>
                    <BtnPrimary onClick={resetForm}>{t("auto.auto_219", "+ Add Another")}</BtnPrimary>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE LAYOUT ── */}
      <div className="min-h-screen bg-[#f7f3ec] flex flex-col lg:flex-row font-['Outfit',sans-serif]">

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 sticky top-0 h-screen overflow-y-auto p-10 xl:p-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            background: "#0c1e11",
            backgroundImage: "radial-gradient(ellipse at 15% 85%,rgba(77,184,122,.15) 0%,transparent 52%),radial-gradient(ellipse at 82% 15%,rgba(12,30,17,.50) 0%,transparent 48%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <SidebarContent dbStats={dbStats} />
        </aside>

        {/* Mobile info banner */}
        <div
          className="lg:hidden px-5 pt-6 pb-7"
          style={{
            background: "#0c1e11",
            backgroundImage: "radial-gradient(ellipse at 10% 90%,rgba(77,184,122,.18) 0%,transparent 50%)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-5 relative z-10">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 bg-gradient-to-br from-[#2d6e3e] to-[#4db87a]">
              🌿
            </span>
            <span className="font-['Cormorant_Garant',serif] text-white text-xl font-semibold">
              {t("auto.auto_220", "Terra")}<span className="text-[#4db87a]">{t("auto.auto_221", "Spotter")}</span>
            </span>
            <span className="ml-auto text-white/25 text-[9.5px] tracking-[1.5px] uppercase font-['Outfit',sans-serif]">
              {t("auto.auto_222", "Land for Green Futures")}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 relative z-10 mb-4">
            {[
              { num: dbStats ? (dbStats.totalLands > 999 ? (dbStats.totalLands / 1000).toFixed(1) + "k" : dbStats.totalLands || 0) : "…", label: "Lands" },
              { num: dbStats ? (dbStats.treesPlanted > 999 ? (dbStats.treesPlanted / 1000).toFixed(1) + "k" : dbStats.treesPlanted || 0) : "…", label: "Trees" },
              { num: dbStats ? (dbStats.volunteers > 999 ? (dbStats.volunteers / 1000).toFixed(1) + "k" : dbStats.volunteers || 0) : "…", label: "Volunteers" },
              { num: dbStats ? (dbStats.treesPlanted * 0.021).toFixed(1) + "t" : "…", label: "CO₂" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.06] rounded-xl p-3 border border-white/[0.09] text-center">
                <div className="font-['Cormorant_Garant',serif] text-[#4db87a] text-lg font-semibold leading-tight">{s.num}</div>
                <div className="text-white/30 text-[9px] uppercase tracking-[1px] mt-0.5 font-['Outfit',sans-serif]">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden relative z-10 pb-0.5">
            {[["📡", "Boundary verified"], ["🌤️", "Climate data fetched"], ["🌳", "Species recommended"], ["🤝", "Volunteers matched"]].map(([icon, label], i) => (
              <div key={i} className="flex items-center gap-2 shrink-0 bg-white/[0.05] rounded-xl px-3 py-2.5 border border-white/[0.08]">
                <span className="text-sm">{icon}</span>
                <span className="text-white/50 text-[11px] font-medium whitespace-nowrap font-['Outfit',sans-serif]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-12 lg:py-12 xl:px-16 flex flex-col gap-6 min-w-0">
          <div className="max-w-2xl w-full mx-auto lg:mx-0 flex flex-col gap-5">

            {/* Page heading */}
            <div>
              <h1 className="font-['Cormorant_Garant',serif] text-[34px] sm:text-[42px] font-semibold text-[#0c1e11] leading-[0.95] tracking-[-0.5px] mb-2">
                {t("main.title", "Submit Land for Plantation")}
              </h1>
              <p className="text-sm sm:text-[15px] text-[#8a7d6e] leading-relaxed font-light">
                {t("main.subtitle", "Mark boundaries, provide details, and upload photos to get matched with planting teams.")}
              </p>
            </div>

            {/* Stepper */}
            <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-[#ede8de] flex gap-1">
              {steps.map(s => (
                <button
                  key={s.n}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium font-['Outfit',sans-serif] transition-all duration-200 cursor-pointer
                    ${step === s.n
                      ? "bg-[#0c1e11] text-white shadow-md"
                      : step > s.n
                        ? "text-[#4db87a] font-semibold hover:bg-emerald-50"
                        : "text-[#b5ac9e] hover:bg-[#f7f3ec]"}`}
                  onClick={() => step > s.n && setStep(s.n)}
                >
                  <StepBadge n={s.n} active={step === s.n} done={step > s.n} />
                  <span className="hidden xs:inline sm:inline">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Step cards */}
            <AnimatePresence mode="wait">

              {/* STEP 1 — Boundary */}
              {step === 1 && (
                <motion.div key="s1" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ede8de] flex flex-col gap-6"
                >
                  <SectionTitle icon="🗺️" title="Draw Land Boundary"
                    subtitle="Open the map, use GPS to find your location, then draw a polygon around the land parcel." />

                  {/* Map trigger */}
                  <button
                    onClick={() => setMapOpen(true)}
                    className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 ${polygonCoords
                        ? "border-[#4db87a] bg-emerald-50/60 shadow-md shadow-emerald-500/10"
                        : "border-dashed border-[#e0d8cf] bg-[#f7f3ec] hover:border-[#4db87a]/50 hover:bg-emerald-50/50"
                      }`}
                  >
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-md bg-gradient-to-br from-[#2d6e3e] to-[#0c1e11]">
                      {polygonCoords ? "✅" : "📍"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#0c1e11] mb-0.5 font-['Outfit',sans-serif]">
                        {polygonCoords ? "Boundary drawn — click to redraw" : "Open map to draw boundary"}
                      </h4>
                      <p className="text-xs text-[#b5ac9e] leading-relaxed truncate font-['Outfit',sans-serif]">
                        {polygonCoords
                          ? `Area: ${Number(areaSqm).toLocaleString()} m² · ${centroid?.lat.toFixed(4)}, ${centroid?.lng.toFixed(4)}`
                          : "Satellite + terrain view · GPS locate · polygon drawing tool"}
                      </p>
                    </div>
                    {polygonCoords && (
                      <span className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-md whitespace-nowrap hidden sm:inline-flex bg-[#0c1e11]">
                        📐 {Number(areaSqm).toLocaleString()} m²
                      </span>
                    )}
                  </button>
                  {errors.polygon && <p className="text-xs text-red-600 font-medium -mt-3 font-['Outfit',sans-serif]">{errors.polygon}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Land Title">
                      <input className={ic(false)} placeholder="e.g. Nanded Highway Plot"
                        value={title} onChange={e => setTitle(e.target.value)} />
                    </Field>
                    <Field label="Brief Description">
                      <input className={ic(false)} placeholder="Optional overview"
                        value={description} onChange={e => setDescription(e.target.value)} />
                    </Field>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#ede8de]">
                    <BtnPrimary onClick={nextStep}>{t("auto.auto_223", "Continue to Owner Info →")}</BtnPrimary>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Owner */}
              {step === 2 && (
                <motion.div key="s2" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ede8de] flex flex-col gap-5"
                >
                  <SectionTitle icon="👤" title="Owner & Contact"
                    subtitle="Who owns this land and do they permit plantation?" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Owner Name" required error={errors.ownerName}>
                      <input className={ic(errors.ownerName)} placeholder="Full name"
                        value={owner.name} onChange={e => setOwner({ ...owner, name: e.target.value })} />
                    </Field>
                    <Field label="Phone Number" required error={errors.ownerPhone}>
                      <input className={ic(errors.ownerPhone)} placeholder="10-digit mobile"
                        value={owner.phone} onChange={e => setOwner({ ...owner, phone: e.target.value })} />
                    </Field>
                  </div>

                  <Field label="Email Address">
                    <input className={ic(false)} type="email" placeholder="owner@example.com"
                      value={owner.email} onChange={e => setOwner({ ...owner, email: e.target.value })} />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Ownership Type" required error={errors.ownershipType}>
                      <select className={sc(errors.ownershipType)}
                        value={owner.ownershipType} onChange={e => setOwner({ ...owner, ownershipType: e.target.value })}>
                        <option value="">{t("auto.auto_224", "Select type")}</option>
                        {["Private", "Government", "Trust / NGO", "Panchayat", "Religious Body", "Other"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Permission to Plant?" required error={errors.permission}>
                      <select className={sc(errors.permission)}
                        value={owner.permission} onChange={e => setOwner({ ...owner, permission: e.target.value })}>
                        <option value="">{t("auto.auto_225", "Select status")}</option>
                        {["Yes — confirmed in writing", "Yes — verbal agreement", "Pending approval", "No"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#ede8de]">
                    <BtnSecondary onClick={prevStep}>{t("auto.auto_226", "← Back")}</BtnSecondary>
                    <BtnPrimary onClick={nextStep}>{t("auto.auto_227", "Continue to Land Details →")}</BtnPrimary>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Land Info */}
              {step === 3 && (
                <motion.div key="s3" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ede8de] flex flex-col gap-5"
                >
                  <SectionTitle icon="🌍" title="Land Details"
                    subtitle="Physical characteristics and current condition of the land" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Land Status" required error={errors.landStatus}>
                      <select className={sc(errors.landStatus)}
                        value={land.status} onChange={e => setLand({ ...land, status: e.target.value })}>
                        <option value="">{t("auto.auto_228", "Select status")}</option>
                        {["Vacant", "Barren", "Roadside Strip", "Open Ground", "Agricultural (unused)", "Industrial Wasteland"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Soil Type">
                      <select className={sc(false)}
                        value={land.soilType} onChange={e => setLand({ ...land, soilType: e.target.value })}>
                        <option value="">{t("auto.auto_229", "Select soil type")}</option>
                        {["Black cotton soil", "Red laterite", "Alluvial", "Sandy", "Rocky / Gravelly", "Unknown"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Water Availability" required error={errors.waterAvailable}>
                      <select className={sc(errors.waterAvailable)}
                        value={land.waterAvailable} onChange={e => setLand({ ...land, waterAvailable: e.target.value })}>
                        <option value="">{t("auto.auto_230", "Select")}</option>
                        {["Yes — borewell", "Yes — canal / river nearby", "Seasonal only", "No"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Watering Frequency" required error={errors.waterFrequency}>
                      <select className={sc(errors.waterFrequency)}
                        value={land.waterFrequency} onChange={e => setLand({ ...land, waterFrequency: e.target.value })}>
                        <option value="">{t("auto.auto_231", "Select")}</option>
                        {["Daily", "Alternate days", "Weekly", "Monthly", "Irregular"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Road Access">
                      <select className={sc(false)}
                        value={land.accessRoad} onChange={e => setLand({ ...land, accessRoad: e.target.value })}>
                        <option value="">{t("auto.auto_232", "Select")}</option>
                        {["Direct road access", "Nearby (within 500m)", "Remote / no access road"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Nearby Landmark">
                      <input className={ic(false)} placeholder="e.g. Near Nanded Bus Stand"
                        value={land.nearbyLandmark} onChange={e => setLand({ ...land, nearbyLandmark: e.target.value })} />
                    </Field>
                  </div>

                  <Field label="Fencing">
                    <div className="flex gap-2 flex-wrap">
                      {["Yes", "No", "Partial"].map(v => (
                        <ToggleBtn key={v} label={v} selected={land.fencing === v}
                          onClick={() => setLand({ ...land, fencing: v })} />
                      ))}
                    </div>
                  </Field>

                  <Field label="Additional Notes">
                    <textarea
                      className={ic(false) + " resize-y min-h-[88px] leading-relaxed"}
                      placeholder="Any special conditions, hazards, or details the planting team should know…"
                      value={land.notes} onChange={e => setLand({ ...land, notes: e.target.value })}
                    />
                  </Field>

                  <div className="flex justify-between items-center pt-3 border-t border-[#ede8de]">
                    <BtnSecondary onClick={prevStep}>{t("auto.auto_233", "← Back")}</BtnSecondary>
                    <BtnPrimary onClick={nextStep}>{t("auto.auto_234", "Continue to Photos →")}</BtnPrimary>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Photos */}
              {step === 4 && (
                <motion.div key="s4" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ede8de] flex flex-col gap-5"
                >
                  <SectionTitle icon="📸" title="Land Photos"
                    subtitle="Upload at least 3 clear photos — different angles help volunteers assess the site" />

                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-[#e0d8cf] rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-3 text-center bg-[#f7f3ec] hover:border-[#4db87a]/50 hover:bg-emerald-50/40 transition-all duration-200">
                      <span className="text-4xl">📂</span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0c1e11] mb-1 font-['Outfit',sans-serif]">{t("auto.auto_235", "Click to choose photos")}</h4>
                        <p className="text-xs text-[#b5ac9e] leading-relaxed font-['Outfit',sans-serif]">{t("auto.auto_236", "JPG, PNG, WEBP · Max 20MB per file · Min 3 required")}</p>
                      </div>
                      <input type="file" multiple accept="image/*" hidden onChange={handleFileChange} />
                    </div>
                  </label>

                  {errors.files && <p className="text-xs text-red-600 font-medium -mt-2 font-['Outfit',sans-serif]">{errors.files}</p>}

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full font-['Outfit',sans-serif] ${files.length >= 3 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {files.length} photo{files.length !== 1 ? "s" : ""} selected
                    </span>
                    {files.length > 0 && files.length < 3 && (
                      <span className="text-xs text-red-500 font-medium font-['Outfit',sans-serif]">{3 - files.length} more required</span>
                    )}
                    {files.length >= 3 && (
                      <span className="text-xs text-[#4db87a] font-semibold font-['Outfit',sans-serif]">{t("auto.auto_237", "✓ Minimum met")}</span>
                    )}
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {previews.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#ede8de] shadow-sm hover:scale-[1.03] transition-transform duration-150">
                          <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeFile(i)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-sm leading-none hover:bg-red-600/80 transition-colors cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.api && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium font-['Outfit',sans-serif]">
                      ⚠ {errors.api}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-[#ede8de]">
                    <BtnSecondary onClick={prevStep}>{t("auto.auto_238", "← Back")}</BtnSecondary>
                    <BtnPrimary onClick={submitLand} disabled={submitting}>
                      {submitting ? <><Spinner /> {t("auto.auto_239", "Submitting…")}</> : "Submit Land 🌱"}
                    </BtnPrimary>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress dots — mobile only */}
            <div className="flex justify-center gap-2 lg:hidden pb-2">
              {steps.map(s => (
                <div key={s.n} className={`rounded-full transition-all duration-300 ${step === s.n ? "w-6 h-2 bg-[#0c1e11]"
                    : step > s.n ? "w-2 h-2 bg-[#4db87a]"
                      : "w-2 h-2 bg-[#e0d8cf]"
                  }`} />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ══ MAP MODAL — redesigned ══════════════════════════════ */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-[6px] z-[9999] flex items-center justify-center p-0 sm:p-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setMapOpen(false)}
          >
            <motion.div
              className="bg-[#0c1e11] w-full max-w-5xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#4db87a]/15"
              style={{ height: "clamp(520px, 90vh, 860px)" }}
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >

              {/* ── Map header ── */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#4db87a]/12 shrink-0 bg-[#0f2916]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#4db87a]/15 border border-[#4db87a]/25 flex items-center justify-center shrink-0 text-[#4db87a]">
                    <PolygonIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-['Cormorant_Garant',serif] text-white font-semibold text-[17px] sm:text-[19px] leading-tight">
                      {t("auto.auto_240", "Draw Land Boundary")}
                    </h3>
                    {polygonCoords ? (
                      <p className="text-[11.5px] text-[#4db87a] font-medium mt-0.5 font-['Outfit',sans-serif]">
                        ✓ Polygon saved · {Number(areaSqm).toLocaleString()} m² · {centroid?.lat.toFixed(4)}, {centroid?.lng.toFixed(4)}
                      </p>
                    ) : (
                      <p className="text-[11.5px] text-white/35 mt-0.5 font-['Outfit',sans-serif] hidden sm:block">
                        {t("auto.auto_241", "Use GPS to find your land, then draw a polygon around it")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* GPS Locate button */}
                  <button
                    onClick={locateUser}
                    disabled={locatingGps}
                    title="Use my GPS location"
                    className={`flex items-center gap-2 px-3 sm:px-4 h-9 rounded-xl border text-[12.5px] font-semibold font-['Outfit',sans-serif] transition-all duration-200 cursor-pointer disabled:opacity-60 ${locatingGps
                        ? "border-[#4db87a]/40 bg-[#4db87a]/10 text-[#4db87a]"
                        : "border-white/15 bg-white/[0.07] text-white/70 hover:border-[#4db87a]/40 hover:bg-[#4db87a]/10 hover:text-[#4db87a]"
                      }`}
                  >
                    {locatingGps ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#4db87a]/30 border-t-[#4db87a] rounded-full animate-spin" />
                        <span className="hidden sm:inline">{t("auto.auto_242", "Locating…")}</span>
                      </>
                    ) : (
                      <>
                        <GpsIcon size={14} />
                        <span className="hidden sm:inline">{t("auto.auto_243", "My Location")}</span>
                      </>
                    )}
                  </button>

                  {/* Confirm button */}
                  {polygonCoords && (
                    <button
                      onClick={() => setMapOpen(false)}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#4db87a] text-[#0c1e11] text-[12.5px] font-semibold font-['Outfit',sans-serif] hover:bg-[#5dcf8a] transition-all duration-200 cursor-pointer active:scale-[0.97] shadow-[0_2px_12px_rgba(77,184,122,0.35)]"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="hidden sm:inline">{t("auto.auto_244", "Confirm boundary")}</span>
                      <span className="sm:hidden">{t("auto.auto_245", "Confirm")}</span>
                    </button>
                  )}

                  {/* Close */}
                  <button
                    onClick={() => setMapOpen(false)}
                    className="w-9 h-9 rounded-xl border border-white/12 bg-white/[0.07] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/14 transition-colors cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* ── Draw instructions banner ── */}
              <AnimatePresence>
                {!polygonCoords && (
                  <motion.div
                    className="bg-[#4db87a]/10 border-b border-[#4db87a]/15 px-5 sm:px-6 py-3 flex items-center gap-3 shrink-0"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-4 flex-wrap w-full">
                      {[
                        { n: "1", text: "Use GPS or navigate to your land" },
                        { n: "2", text: 'Click the polygon icon in the top-right toolbar' },
                        { n: "3", text: "Click to place corner points around the land" },
                        { n: "4", text: "Click the first point again to close & confirm" },
                      ].map(s => (
                        <div key={s.n} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#4db87a]/20 text-[#4db87a] text-[10px] font-bold flex items-center justify-center shrink-0 font-['Outfit',sans-serif]">
                            {s.n}
                          </span>
                          <span className="text-[11.5px] text-white/55 font-['Outfit',sans-serif]">{s.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Map tile switcher & map body ── */}
              <div className="flex-1 relative overflow-hidden">

                {/* Tile layer switcher — floating top-left */}
                <div className="absolute top-3 left-3 z-[1000] flex gap-1.5">
                  {Object.entries(tileLayers).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setMapLayer(key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold font-['Outfit',sans-serif] border transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-md ${mapLayer === key
                          ? "bg-[#0c1e11] border-[#4db87a]/50 text-[#4db87a]"
                          : "bg-black/60 border-white/15 text-white/60 hover:bg-black/75 hover:text-white"
                        }`}
                    >
                      <span>{val.icon}</span>
                      <span className="hidden sm:inline">{val.label}</span>
                    </button>
                  ))}
                </div>

                {/* Area badge — shown after polygon drawn */}
                <AnimatePresence>
                  {polygonCoords && (
                    <motion.div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="flex items-center gap-3 bg-[#0c1e11]/90 backdrop-blur-md border border-[#4db87a]/30 text-white px-5 py-3 rounded-2xl shadow-2xl">
                        <span className="text-[#4db87a] text-lg">✓</span>
                        <div>
                          <div className="font-['Cormorant_Garant',serif] text-[20px] font-semibold text-[#4db87a] leading-none">
                            {Number(areaSqm).toLocaleString()} m²
                          </div>
                          <div className="text-[10.5px] text-white/40 uppercase tracking-[1.2px] font-['Outfit',sans-serif] mt-0.5">
                            Area mapped · ~{Math.floor(areaSqm / 20)} trees est.
                          </div>
                        </div>
                        <button
                          onClick={() => setMapOpen(false)}
                          className="ml-2 px-3 py-1.5 rounded-xl bg-[#4db87a] text-[#0c1e11] text-[11.5px] font-bold font-['Outfit',sans-serif] hover:bg-[#5dcf8a] transition-colors cursor-pointer"
                        >
                          {t("auto.auto_246", "Confirm →")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <MapContainer
                  key={mapLayer}
                  center={[18.6725, 77.3013]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  ref={mapRef}
                  zoomControl={true}
                >
                  <TileLayer
                    url={tileLayers[mapLayer].url}
                    attribution={tileLayers[mapLayer].attribution}
                    maxZoom={19}
                  />
                  <FeatureGroup>
                    <EditControl
                      position="topright"
                      onCreated={onPolygonCreated}
                      draw={{
                        rectangle: false,
                        circle: false,
                        marker: false,
                        polyline: false,
                        circlemarker: false,
                        polygon: {
                          allowIntersection: true,
                          showArea: true,
                          metric: true,
                          shapeOptions: {
                            color: "#4db87a",
                            fillColor: "#4db87a",
                            fillOpacity: 0.15,
                            weight: 2.5,
                          },
                        },
                      }}
                      edit={{ edit: false, remove: true }}
                    />
                  </FeatureGroup>
                </MapContainer>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Main;