/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Main land submission form with polygon mapping and image upload.
*/
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Skeleton shimmer ─────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div className={`rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse ${className}`} />
);

// ─── Page skeleton (no navbar — navbar is external) ──────────
const PageSkeleton = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
      @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    `}</style>
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col lg:flex-row">

      {/* sidebar skeleton — desktop only */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 bg-[#163d25] p-10 gap-8 shrink-0">
        <div className="flex items-center gap-3">
          <Sk className="w-9 h-9 rounded-xl bg-white/10" />
          <Sk className="h-6 w-32 bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_,i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/8 flex flex-col gap-2">
              <Sk className="h-7 w-12 bg-white/10" />
              <Sk className="h-3 w-16 bg-white/6" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {[...Array(3)].map((_,i) => (
            <div key={i} className="border-l-2 border-white/10 pl-4 flex flex-col gap-2">
              <Sk className="h-3.5 w-36 bg-white/10" />
              <Sk className="h-3 w-full bg-white/6" />
              <Sk className="h-3 w-4/5 bg-white/6" />
            </div>
          ))}
        </div>
      </div>

      {/* mobile info banner skeleton */}
      <div className="lg:hidden bg-[#163d25] px-5 py-6 flex flex-col gap-4">
        <Sk className="h-6 w-40 bg-white/10" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_,i) => <Sk key={i} className="h-16 rounded-xl bg-white/5" />)}
        </div>
      </div>

      {/* form skeleton */}
      <div className="flex-1 p-5 sm:p-8 lg:p-14 flex flex-col gap-6 max-w-3xl">
        <Sk className="h-9 w-72 max-w-full" />
        <Sk className="h-4 w-80 max-w-full" />
        <div className="bg-white rounded-2xl p-2 flex gap-1 shadow-sm border border-slate-100">
          {[...Array(4)].map((_,i) => <Sk key={i} className="flex-1 h-10 rounded-xl" />)}
        </div>
        <div className="bg-white rounded-3xl p-7 flex flex-col gap-5 shadow-sm border border-slate-100">
          <div className="flex gap-4 pb-5 border-b border-slate-100">
            <Sk className="w-11 h-11 rounded-xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Sk className="h-5 w-40" />
              <Sk className="h-3 w-56" />
            </div>
          </div>
          <Sk className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_,i) => (
              <div key={i} className="flex flex-col gap-2">
                <Sk className="h-3 w-20" />
                <Sk className="h-11 w-full" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Sk className="h-11 w-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </>
);

// ─── Helpers ──────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10.5px] font-semibold text-[#3d2b1f] uppercase tracking-[0.9px]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>}
  </div>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
    <span className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0 border border-emerald-100">
      {icon}
    </span>
    <div>
      <h3 style={{ fontFamily:"'Playfair Display',serif" }}
        className="text-[17px] font-semibold text-[#163d25] leading-tight">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
    </div>
  </div>
);

const ic = (err) =>
  `w-full px-4 py-3 border-[1.5px] rounded-xl text-sm text-[#111] bg-white outline-none
   transition-all duration-200 font-[DM_Sans]
   ${err
     ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
     : "border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-[#fdfffe]"}`;

const sc = (err) => ic(err) + " cursor-pointer appearance-none";

const ToggleBtn = ({ label, selected, onClick }) => (
  <button onClick={onClick}
    className={`px-4 py-2 rounded-full border-[1.5px] text-sm font-medium transition-all duration-150 cursor-pointer
      ${selected
        ? "bg-gradient-to-br from-[#256638] to-[#163d25] border-transparent text-white shadow-md"
        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-400 hover:text-[#163d25] hover:bg-emerald-50"}`}>
    {label}
  </button>
);

const BtnPrimary = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled}
    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#256638] to-[#163d25]
               text-white text-sm font-semibold shadow-lg shadow-emerald-900/20
               hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
               transition-all duration-150 cursor-pointer whitespace-nowrap">
    {children}
  </button>
);

const BtnSecondary = ({ onClick, children }) => (
  <button onClick={onClick}
    className="px-5 py-3 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-500 text-sm font-medium
               hover:border-[#163d25] hover:text-[#163d25] hover:bg-emerald-50 transition-all duration-150 cursor-pointer">
    {children}
  </button>
);

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

const StepBadge = ({ n, active, done }) => (
  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-[1.5px] shrink-0
    ${done   ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
    : active ? "bg-white border-white text-[#163d25]"
              : "border-current"}`}>
    {done ? "✓" : n}
  </span>
);

// ─── Sidebar content (shared desktop + mobile) ────────────────
const SidebarContent = ({ compact = false, dbStats }) => {
  const formatNum = (num) => {
    if (!num) return "0";
    return num > 999 ? (num/1000).toFixed(1) + 'k' : String(num);
  };
  const stats = [
    { num: dbStats ? formatNum(dbStats.totalLands) : "...", label:"Lands Mapped"  },
    { num: dbStats ? formatNum(dbStats.treesPlanted) : "...",  label:"Trees Planted" },
    { num: dbStats ? formatNum(dbStats.volunteers) : "...",  label:"Volunteers"    },
    { num: dbStats ? (dbStats.treesPlanted * 0.021).toFixed(1) + 't' : "...",  label:"CO₂ Captured"  },
  ];
  const impact = [
    ["Micro-climate restoration",  "Even small plantations reduce surface temperature by 2–4°C in surrounding areas."],
    ["Groundwater recharge",        "Native trees improve aquifer levels and reduce surface runoff on barren land."],
    ["Decades of carbon capture",   "Verified species selections sequester carbon continuously — not just seasonally."],
  ];
  const process = [
    "Boundary verified against satellite imagery",
    "Soil, rainfall, and climate data fetched via APIs",
    "Native tree species recommended by density",
    "Land matched with local volunteers or NGOs",
  ];

  return (
    <div className="flex flex-col gap-7 relative z-10">
      {/* Brand — only on desktop sidebar */}
      {!compact && (
        <div>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background:"linear-gradient(145deg,#256638,#5cb87a)", boxShadow:"0 2px 12px rgba(92,184,122,0.35)" }}>
              🌿
            </span>
            <span style={{ fontFamily:"'Playfair Display',serif" }}
              className="text-white text-2xl font-bold tracking-tight">
              Terra<span className="text-emerald-400">Spotter</span>
            </span>
          </div>
          <p className="text-white/30 text-[10px] tracking-[2px] uppercase mt-1.5 ml-12">
            Land for Green Futures
          </p>
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-2.5 ${compact ? "grid-cols-4" : "grid-cols-2"}`}>
        {stats.map(s => (
          <div key={s.label}
            className="bg-white/[0.06] rounded-xl p-3.5 border border-white/[0.09]
                       hover:bg-white/[0.10] hover:border-emerald-500/25 transition-all duration-200 group">
            <div style={{ fontFamily:"'Playfair Display',serif" }}
              className={`text-emerald-400 font-semibold leading-none mb-1 group-hover:text-emerald-300 transition-colors
                ${compact ? "text-xl" : "text-2xl"}`}>
              {s.num}
            </div>
            <div className="text-white/35 text-[10px] uppercase tracking-[1.1px] font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Impact — hidden in compact mode */}
      {!compact && (
        <div className="flex flex-col gap-5">
          {impact.map(([h, p]) => (
            <div key={h} className="border-l-2 border-emerald-500/40 pl-4 hover:border-emerald-400 transition-colors">
              <h4 className="text-white text-[13px] font-semibold mb-1">{h}</h4>
              <p className="text-white/45 text-xs leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      )}

      {/* Process */}
      <div className={compact ? "" : "border-t border-white/[0.08] pt-6"}>
        {!compact && (
          <p className="text-white/30 text-[10px] uppercase tracking-[2px] font-semibold mb-4">What happens next</p>
        )}
        <ol className={`flex flex-col gap-2.5 ${compact ? "hidden sm:flex" : ""}`}>
          {process.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-white/50 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold
                               flex items-center justify-center shrink-0 mt-0.5">
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
  const [user,       setUser]       = useState(null);
  const [dbStats,    setDbStats]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [errors,     setErrors]     = useState({});

  const [mapOpen,        setMapOpen]        = useState(false);
  const mapRef           = useRef(null);
  const locationLayerRef = useRef(null);

  const [polygonCoords, setPolygonCoords] = useState(null);
  const [centroid,      setCentroid]      = useState(null);
  const [areaSqm,       setAreaSqm]       = useState(null);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [owner,       setOwner]       = useState({ name:"", phone:"", email:"", ownershipType:"", permission:"" });
  const [land,        setLand]        = useState({
    status:"", accessRoad:"", waterAvailable:"",
    waterFrequency:"", fencing:"No", soilType:"", nearbyLandmark:"", notes:"",
  });
  const [files,    setFiles]    = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true }).catch(() => null),
      axios.get(`${BASE_URL}/api/stats`).catch(() => null)
    ]).then(([authRes, statsRes]) => {
      if (authRes && authRes.data) setUser(authRes.data);
      if (statsRes && statsRes.data) setDbStats(statsRes.data);
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
    mapRef.current.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    mapRef.current.on("locationfound", e => {
      if (locationLayerRef.current) mapRef.current.removeLayer(locationLayerRef.current);
      locationLayerRef.current = L.layerGroup([
        L.marker(e.latlng), L.circle(e.latlng, { radius: e.accuracy }),
      ]).addTo(mapRef.current);
    });
    mapRef.current.on("locationerror", () => alert("Enable GPS permission."));
  };

  const onPolygonCreated = (e) => {
    const latlngs = e.layer.getLatLngs()[0];
    setPolygonCoords(latlngs.map(p => ({ lat: p.lat, lng: p.lng })));
    setAreaSqm(L.GeometryUtil.geodesicArea(latlngs).toFixed(2));
    const lat = latlngs.reduce((s, p) => s + p.lat, 0) / latlngs.length;
    const lng = latlngs.reduce((s, p) => s + p.lng, 0) / latlngs.length;
    setCentroid({ lat, lng });
    mapRef.current.flyTo([lat, lng], 15);
  };

  const handleFileChange = (e) => setFiles([...e.target.files]);
  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const validateStep = (s) => {
    const e = {};
    if (s === 1 && !polygonCoords) e.polygon = "Please draw the land boundary on the map";
    if (s === 2) {
      if (!owner.name.trim())   e.ownerName     = "Owner name is required";
      if (!owner.phone.trim())  e.ownerPhone    = "Phone number is required";
      if (!owner.ownershipType) e.ownershipType = "Select ownership type";
      if (!owner.permission)    e.permission    = "Select permission status";
    }
    if (s === 3) {
      if (!land.status)         e.landStatus     = "Select land status";
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

  const steps = [
    { n:1, label:"Boundary" },
    { n:2, label:"Owner"    },
    { n:3, label:"Details"  },
    { n:4, label:"Photos"   },
  ];

  const cardMotion = {
    initial:{ opacity:0, x:24 }, animate:{ opacity:1, x:0 },
    exit:{ opacity:0, x:-24 }, transition:{ duration:0.25, ease:[0.22,1,0.36,1] },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        select { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a89e93' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:38px; }
        .hide-scroll::-webkit-scrollbar { display:none; }
        .hide-scroll { scrollbar-width:none; }
      `}</style>

      <Helmet>
        <title>TerraSpotter — Submit Land</title>
        <meta name="description" content="Submit a land parcel for afforestation: draw boundary, upload photos, add details." />
      </Helmet>

      {/* ── SUCCESS OVERLAY ───────────────────────────── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[9999] flex items-center justify-center p-5"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={resetForm}>
            <motion.div
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
              initial={{ opacity:0, y:28, scale:0.96 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, scale:0.96 }}
              transition={{ type:"spring", bounce:0.3, duration:0.5 }}
              onClick={e => e.stopPropagation()}>
              <div className="h-1 bg-gradient-to-r from-[#163d25] via-emerald-400 to-[#163d25]" />
              <div className="p-8 flex gap-5 items-start">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg"
                  style={{ background:"linear-gradient(145deg,#3a8c57,#163d25)" }}
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ delay:0.18, type:"spring", bounce:0.5 }}>
                  🌱
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 style={{ fontFamily:"'Playfair Display',serif" }}
                    className="text-2xl font-bold text-[#163d25] mb-2">Land Submitted!</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">
                    Thanks for your contribution. Every boundary drawn brings India closer to a greener future 🌿
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <BtnSecondary onClick={resetForm}>Close</BtnSecondary>
                    <BtnPrimary onClick={resetForm}>+ Add Another</BtnPrimary>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE LAYOUT ───────────────────────────────── */}
      <div className="min-h-screen bg-[#f8f5f0] flex flex-col lg:flex-row">

        {/* ── DESKTOP SIDEBAR ───────────────────────── */}
        <aside
          className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 sticky top-0 h-screen overflow-y-auto hide-scroll p-10 xl:p-12"
          style={{
            background:"#163d25",
            backgroundImage:"radial-gradient(ellipse at 15% 85%,rgba(92,184,122,.18) 0%,transparent 52%),radial-gradient(ellipse at 82% 15%,rgba(22,61,37,.50) 0%,transparent 48%)",
          }}>
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />
          <SidebarContent dbStats={dbStats} />
        </aside>

        {/* ── MOBILE INFO BANNER (top, before form) ─── */}
        {/* On mobile/tablet this replaces the sidebar and sits above the form */}
        <div
          className="lg:hidden px-5 pt-6 pb-7"
          style={{
            background:"#163d25",
            backgroundImage:"radial-gradient(ellipse at 10% 90%,rgba(92,184,122,.2) 0%,transparent 50%),radial-gradient(ellipse at 90% 10%,rgba(22,61,37,.5) 0%,transparent 50%)",
          }}>
          <div className="pointer-events-none absolute left-0 right-0 h-full opacity-[0.04]"
            style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)", backgroundSize:"36px 36px" }} />

          {/* Brand row */}
          <div className="flex items-center gap-2.5 mb-5 relative z-10">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
              style={{ background:"linear-gradient(145deg,#256638,#5cb87a)" }}>🌿</span>
            <span style={{ fontFamily:"'Playfair Display',serif" }}
              className="text-white text-xl font-bold tracking-tight">
              Terra<span className="text-emerald-400">Spotter</span>
            </span>
            <span className="ml-auto text-white/30 text-[10px] tracking-[1.5px] uppercase">Land for Green Futures</span>
          </div>

          {/* Stats — 4 cols on mobile */}
          <div className="grid grid-cols-4 gap-2 relative z-10 mb-5">
            {[
              { num: dbStats ? (dbStats.totalLands > 999 ? (dbStats.totalLands/1000).toFixed(1)+'k' : dbStats.totalLands || 0) : "...", label:"Lands"    },
              { num: dbStats ? (dbStats.treesPlanted > 999 ? (dbStats.treesPlanted/1000).toFixed(1)+'k' : dbStats.treesPlanted || 0) : "...",  label:"Trees"    },
              { num: dbStats ? (dbStats.volunteers > 999 ? (dbStats.volunteers/1000).toFixed(1)+'k' : dbStats.volunteers || 0) : "...",  label:"Volunteers"},
              { num: dbStats ? (dbStats.treesPlanted * 0.021).toFixed(1)+'t' : "...",  label:"CO₂"      },
            ].map(s => (
              <div key={s.label}
                className="bg-white/[0.06] rounded-xl p-3 border border-white/[0.09] text-center">
                <div style={{ fontFamily:"'Playfair Display',serif" }}
                  className="text-emerald-400 text-lg font-semibold leading-tight">{s.num}</div>
                <div className="text-white/35 text-[9px] uppercase tracking-[1px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Process steps — horizontal scroll on very small screens */}
          <div className="relative z-10">
            <p className="text-white/30 text-[9px] uppercase tracking-[1.8px] font-semibold mb-3">What happens next</p>
            <div className="flex gap-3 overflow-x-auto hide-scroll pb-0.5">
              {[
                ["📡", "Boundary verified"],
                ["🌤️", "Climate data fetched"],
                ["🌳", "Species recommended"],
                ["🤝", "Volunteers matched"],
              ].map(([icon, label], i) => (
                <div key={i} className="flex items-center gap-2 shrink-0 bg-white/[0.05] rounded-xl px-3 py-2.5 border border-white/[0.08]">
                  <span className="text-sm">{icon}</span>
                  <span className="text-white/55 text-[11px] font-medium whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ──────────────────────────── */}
        <main className="flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-12 lg:py-12 xl:px-16 flex flex-col gap-6 min-w-0">
          <div className="max-w-2xl w-full mx-auto lg:mx-0 flex flex-col gap-5">

            {/* Page header */}
            <div>
              <h1 style={{ fontFamily:"'Playfair Display',serif" }}
                className="text-3xl sm:text-4xl font-bold text-[#163d25] leading-tight tracking-tight mb-2">
                Submit Land for Plantation
              </h1>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                Mark boundaries, provide details, and upload photos to get matched with planting teams.
              </p>
            </div>

            {/* ── STEPPER ─────────────────────────── */}
            <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
              {steps.map(s => (
                <button key={s.n}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer
                    ${step === s.n
                      ? "bg-gradient-to-br from-[#256638] to-[#163d25] text-white shadow-md shadow-emerald-900/20"
                      : step > s.n
                        ? "text-emerald-600 font-semibold hover:bg-emerald-50"
                        : "text-slate-400 hover:bg-slate-50"}`}
                  onClick={() => step > s.n && setStep(s.n)}>
                  <StepBadge n={s.n} active={step === s.n} done={step > s.n} />
                  <span className="hidden xs:inline sm:inline">{s.label}</span>
                </button>
              ))}
            </div>

            {/* ── STEP CARDS ──────────────────────── */}
            <AnimatePresence mode="wait">

              {/* STEP 1 — Boundary */}
              {step === 1 && (
                <motion.div key="s1" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">

                  <SectionTitle icon="🗺️" title="Draw Land Boundary"
                    subtitle="Open the map and draw a polygon around the land parcel" />

                  {/* Map trigger button */}
                  <button onClick={() => setMapOpen(true)}
                    className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200
                      ${polygonCoords
                        ? "border-emerald-400 bg-emerald-50/60 shadow-md shadow-emerald-500/10"
                        : "border-dashed border-slate-200 bg-[#f8f5f0] hover:border-emerald-300 hover:bg-emerald-50/50"}`}>
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-md"
                      style={{ background:"linear-gradient(145deg,#256638,#163d25)" }}>
                      {polygonCoords ? "✅" : "📍"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#163d25] mb-0.5">
                        {polygonCoords ? "Boundary drawn — click to redraw" : "Open map to draw boundary"}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed truncate">
                        {polygonCoords
                          ? `Area: ${Number(areaSqm).toLocaleString()} m² · ${centroid?.lat.toFixed(4)}, ${centroid?.lng.toFixed(4)}`
                          : "Use the polygon tool to mark the exact parcel"}
                      </p>
                    </div>
                    {polygonCoords && (
                      <span className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-md whitespace-nowrap hidden sm:inline-flex"
                        style={{ background:"linear-gradient(145deg,#256638,#163d25)" }}>
                        📐 {Number(areaSqm).toLocaleString()} m²
                      </span>
                    )}
                  </button>
                  {errors.polygon && <p className="text-xs text-red-600 font-medium -mt-3">{errors.polygon}</p>}

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

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <BtnPrimary onClick={nextStep}>Continue to Owner Info →</BtnPrimary>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Owner */}
              {step === 2 && (
                <motion.div key="s2" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-5">

                  <SectionTitle icon="👤" title="Owner & Contact"
                    subtitle="Who owns this land and do they permit plantation?" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Owner Name" required error={errors.ownerName}>
                      <input className={ic(errors.ownerName)} placeholder="Full name"
                        value={owner.name} onChange={e => setOwner({...owner, name:e.target.value})} />
                    </Field>
                    <Field label="Phone Number" required error={errors.ownerPhone}>
                      <input className={ic(errors.ownerPhone)} placeholder="10-digit mobile"
                        value={owner.phone} onChange={e => setOwner({...owner, phone:e.target.value})} />
                    </Field>
                  </div>

                  <Field label="Email Address">
                    <input className={ic(false)} type="email" placeholder="owner@example.com"
                      value={owner.email} onChange={e => setOwner({...owner, email:e.target.value})} />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Ownership Type" required error={errors.ownershipType}>
                      <select className={sc(errors.ownershipType)}
                        value={owner.ownershipType} onChange={e => setOwner({...owner, ownershipType:e.target.value})}>
                        <option value="">Select type</option>
                        {["Private","Government","Trust / NGO","Panchayat","Religious Body","Other"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Permission to Plant?" required error={errors.permission}>
                      <select className={sc(errors.permission)}
                        value={owner.permission} onChange={e => setOwner({...owner, permission:e.target.value})}>
                        <option value="">Select status</option>
                        {["Yes — confirmed in writing","Yes — verbal agreement","Pending approval","No"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <BtnSecondary onClick={prevStep}>← Back</BtnSecondary>
                    <BtnPrimary onClick={nextStep}>Continue to Land Details →</BtnPrimary>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Land Info */}
              {step === 3 && (
                <motion.div key="s3" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-5">

                  <SectionTitle icon="🌍" title="Land Details"
                    subtitle="Physical characteristics and current condition of the land" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Land Status" required error={errors.landStatus}>
                      <select className={sc(errors.landStatus)}
                        value={land.status} onChange={e => setLand({...land, status:e.target.value})}>
                        <option value="">Select status</option>
                        {["Vacant","Barren","Roadside Strip","Open Ground","Agricultural (unused)","Industrial Wasteland"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Soil Type">
                      <select className={sc(false)}
                        value={land.soilType} onChange={e => setLand({...land, soilType:e.target.value})}>
                        <option value="">Select soil type</option>
                        {["Black cotton soil","Red laterite","Alluvial","Sandy","Rocky / Gravelly","Unknown"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Water Availability" required error={errors.waterAvailable}>
                      <select className={sc(errors.waterAvailable)}
                        value={land.waterAvailable} onChange={e => setLand({...land, waterAvailable:e.target.value})}>
                        <option value="">Select</option>
                        {["Yes — borewell","Yes — canal / river nearby","Seasonal only","No"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Watering Frequency" required error={errors.waterFrequency}>
                      <select className={sc(errors.waterFrequency)}
                        value={land.waterFrequency} onChange={e => setLand({...land, waterFrequency:e.target.value})}>
                        <option value="">Select</option>
                        {["Daily","Alternate days","Weekly","Monthly","Irregular"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Road Access">
                      <select className={sc(false)}
                        value={land.accessRoad} onChange={e => setLand({...land, accessRoad:e.target.value})}>
                        <option value="">Select</option>
                        {["Direct road access","Nearby (within 500m)","Remote / no access road"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Nearby Landmark">
                      <input className={ic(false)} placeholder="e.g. Near Nanded Bus Stand"
                        value={land.nearbyLandmark} onChange={e => setLand({...land, nearbyLandmark:e.target.value})} />
                    </Field>
                  </div>

                  <Field label="Fencing">
                    <div className="flex gap-2 flex-wrap">
                      {["Yes","No","Partial"].map(v => (
                        <ToggleBtn key={v} label={v} selected={land.fencing === v}
                          onClick={() => setLand({...land, fencing:v})} />
                      ))}
                    </div>
                  </Field>

                  <Field label="Additional Notes">
                    <textarea className={ic(false) + " resize-y min-h-[88px] leading-relaxed"}
                      placeholder="Any special conditions, hazards, or details the planting team should know…"
                      value={land.notes} onChange={e => setLand({...land, notes:e.target.value})} />
                  </Field>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <BtnSecondary onClick={prevStep}>← Back</BtnSecondary>
                    <BtnPrimary onClick={nextStep}>Continue to Photos →</BtnPrimary>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Photos */}
              {step === 4 && (
                <motion.div key="s4" {...cardMotion}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-5">

                  <SectionTitle icon="📸" title="Land Photos"
                    subtitle="Upload at least 3 clear photos — different angles help volunteers assess the site" />

                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-10
                                    flex flex-col items-center gap-3 text-center
                                    bg-[#f8f5f0] hover:border-emerald-400 hover:bg-emerald-50/50
                                    transition-all duration-200">
                      <span className="text-4xl">📂</span>
                      <div>
                        <h4 className="text-sm font-semibold text-[#163d25] mb-1">Click to choose photos</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">JPG, PNG, WEBP · Max 20MB per file · Min 3 required</p>
                      </div>
                      <input type="file" multiple accept="image/*" hidden onChange={handleFileChange} />
                    </div>
                  </label>

                  {errors.files && <p className="text-xs text-red-600 font-medium -mt-2">{errors.files}</p>}

                  {/* Count badge */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full
                      ${files.length >= 3 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {files.length} photo{files.length !== 1 ? "s" : ""} selected
                    </span>
                    {files.length > 0 && files.length < 3 && (
                      <span className="text-xs text-red-500 font-medium">{3 - files.length} more required</span>
                    )}
                    {files.length >= 3 && (
                      <span className="text-xs text-emerald-600 font-semibold">✓ Minimum met</span>
                    )}
                  </div>

                  {/* Photo grid */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {previews.map((url, i) => (
                        <div key={i}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-100
                                     shadow-sm hover:scale-[1.03] transition-transform duration-150">
                          <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
                          <button onClick={() => removeFile(i)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white
                                       flex items-center justify-center text-sm leading-none
                                       hover:bg-red-600/80 transition-colors cursor-pointer">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.api && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
                      ⚠ {errors.api}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <BtnSecondary onClick={prevStep}>← Back</BtnSecondary>
                    <BtnPrimary onClick={submitLand} disabled={submitting}>
                      {submitting ? <><Spinner /> Submitting…</> : "Submit Land 🌱"}
                    </BtnPrimary>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress dots — mobile only */}
            <div className="flex justify-center gap-2 lg:hidden pb-2">
              {steps.map(s => (
                <div key={s.n}
                  className={`rounded-full transition-all duration-300
                    ${step === s.n ? "w-6 h-2 bg-[#163d25]"
                    : step > s.n  ? "w-2 h-2 bg-emerald-400"
                    : "w-2 h-2 bg-slate-200"}`} />
              ))}
            </div>

          </div>
        </main>
      </div>

      {/* ── MAP MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            className="fixed inset-0 bg-black/55 z-[9999] flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setMapOpen(false)}>
            <motion.div
              className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
              style={{ height:"clamp(460px,88vh,800px)" }}
              initial={{ scale:0.96, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.96, opacity:0 }}
              transition={{ duration:0.22, ease:[0.22,1,0.36,1] }}>

              {/* Map header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 shrink-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-base shrink-0 border border-emerald-100">
                    📍
                  </span>
                  <div className="min-w-0">
                    <h3 style={{ fontFamily:"'Playfair Display',serif" }}
                      className="text-[#163d25] font-semibold text-base sm:text-lg leading-tight">
                      Draw Land Boundary
                    </h3>
                    {polygonCoords && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        ✓ Polygon drawn · {Number(areaSqm).toLocaleString()} m²
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={locateUser}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
                               text-slate-600 text-xs font-medium hover:border-emerald-400 hover:bg-emerald-50
                               hover:text-[#163d25] transition-all cursor-pointer">
                    📍 Locate me
                  </button>
                  {polygonCoords && (
                    <BtnPrimary onClick={() => setMapOpen(false)}>
                      ✓ <span className="hidden sm:inline">Confirm boundary</span><span className="sm:hidden">Confirm</span>
                    </BtnPrimary>
                  )}
                  <button onClick={() => setMapOpen(false)}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center
                               text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer text-sm">
                    ✕
                  </button>
                </div>
              </div>

              {/* Map body */}
              <div className="flex-1 overflow-hidden">
                <MapContainer
                  center={[18.6725, 77.3013]}
                  zoom={13}
                  style={{ height:"100%", width:"100%" }}
                  ref={mapRef}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FeatureGroup>
                    <EditControl
                      position="topright"
                      onCreated={onPolygonCreated}
                      draw={{ rectangle:false, circle:false, marker:false, polyline:false, circlemarker:false }}
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