/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Main land submission form with polygon mapping and image upload.
 */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
const BASE_URL = import.meta.env.VITE_API_URL;
import LoadingSpinner from "./ui/LoadingSpinner";

// ── Tiny helpers ────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="ts-field">
    <label className="ts-label">
      {label} {required && <span className="ts-req">*</span>}
    </label>
    {children}
    {error && <p className="ts-err">{error}</p>}
  </div>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="ts-section-title">
    <span className="ts-section-icon">{icon}</span>
    <div>
      <h3 className="ts-section-h">{title}</h3>
      {subtitle && <p className="ts-section-sub">{subtitle}</p>}
    </div>
  </div>
);

const StepBadge = ({ n, active, done }) => (
  <div className={`ts-step-badge ${active ? "active" : ""} ${done ? "done" : ""}`}>
    {done ? "✓" : n}
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const Main = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [mapOpen, setMapOpen] = useState(false);
  const mapRef = useRef(null);
  const locationLayerRef = useRef(null);

  const [polygonCoords, setPolygonCoords] = useState(null);
  const [centroid, setCentroid] = useState(null);
  const [areaSqm, setAreaSqm] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState({
    name: "", phone: "", email: "", ownershipType: "", permission: "",
  });
  const [land, setLand] = useState({
    status: "", accessRoad: "", waterAvailable: "",
    waterFrequency: "", fencing: "No", soilType: "", nearbyLandmark: "", notes: "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mapOpen && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 300);
    }
  }, [mapOpen]);

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const locateUser = () => {
    if (!mapRef.current) return;
    mapRef.current.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    mapRef.current.on("locationfound", (e) => {
      if (locationLayerRef.current) mapRef.current.removeLayer(locationLayerRef.current);
      locationLayerRef.current = L.layerGroup([
        L.marker(e.latlng),
        L.circle(e.latlng, { radius: e.accuracy }),
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
    setSubmitted(false);
    setStep(1);
    setPolygonCoords(null);
    setAreaSqm(null);
    setFiles([]);
    setTitle("");
    setDescription("");
  };

  const submitLand = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title || "Land Entry",
        description,
        polygonCoords: JSON.stringify(polygonCoords),
        centroid,
        areaSqm,
        owner,
        land,
      };
      const res = await axios.post(`${BASE_URL}/api/lands`, payload, { withCredentials: true });
      const landId = res.data.id;
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));
      await axios.post(`${BASE_URL}/api/lands/${landId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrors({ api: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading workspace..." />;

  // ── Success overlay ────────────────────────────────────────────────────────
  if (submitted) return (
    <motion.div
      className="ts-success-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onClick={resetForm}
    >
      <motion.div
        className="ts-success-modal"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top stripe */}
        <div className="ts-success-stripe" />

        <div className="ts-success-body">
          <motion.div className="ts-success-icon"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.18, type: "spring", bounce: 0.5 }}>
            🌱
          </motion.div>

          <div className="ts-success-text">
            <h2>Land Submitted!</h2>
            <p>Thanks for your contribution. Every boundary drawn brings India closer to a greener future 🌿</p>
            <div className="ts-success-actions">
              <button className="ts-btn-secondary" onClick={resetForm}>Close</button>
              <button className="ts-btn-primary" onClick={resetForm}>+ Add Another</button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const steps = [
    { n: 1, label: "Boundary" },
    { n: 2, label: "Owner" },
    { n: 3, label: "Land Info" },
    { n: 4, label: "Photos" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:        #163d25;
          --canopy:        #256638;
          --leaf:          #3a8c57;
          --sprout:        #5cb87a;
          --sprout-light:  #a8dbb9;
          --mist:          #edf7f2;
          --sand:          #f8f5f0;
          --cream:         #fdfbf8;
          --earth:         #3d2b1f;
          --bark:          #8b6f5c;
          --ink:           #111;
          --smoke:         #6b6457;
          --muted:         #a89e93;
          --line:          #e8e2da;
          --danger:        #b03a2e;
          --danger-bg:     #fdf3f2;
          --white:         #ffffff;
          --green-glow:    rgba(58,140,87,0.18);
          --green-glow-s:  rgba(58,140,87,0.28);
          --shadow:        0 4px 24px rgba(22,61,37,0.09);
          --shadow-lg:     0 16px 56px rgba(22,61,37,0.15);
          --radius:        14px;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--sand); color: var(--ink); }

        /* ── Page grid ── */
        .ts-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 360px 1fr;
        }

        /* ── Sidebar ── */
        .ts-sidebar {
          background: var(--forest);
          color: white;
          padding: 52px 38px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .ts-sidebar::-webkit-scrollbar { display: none; }

        /* Layered atmosphere */
        .ts-sidebar { position: relative; }
        .ts-sidebar::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 15% 85%, rgba(92,184,122,.18) 0%, transparent 52%),
            radial-gradient(ellipse at 82% 15%, rgba(22,61,37,.50) 0%, transparent 48%);
          pointer-events: none;
          z-index: 0;
        }
        .ts-sidebar::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }
        .ts-sidebar > * { position: relative; z-index: 1; }

        .ts-sidebar-brand {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.4px;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ts-sidebar-brand-mark {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(145deg, var(--canopy), var(--sprout));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          box-shadow: 0 2px 12px var(--green-glow-s), inset 0 1px 0 rgba(255,255,255,0.15);
          flex-shrink: 0;
        }
        .ts-sidebar-brand span { color: var(--sprout); }

        .ts-sidebar-tagline {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: -28px;
        }

        /* Stat grid */
        .ts-stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .ts-stat {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s, border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .ts-stat::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(92,184,122,0.5), transparent);
          opacity: 0;
          transition: opacity 0.22s;
        }
        .ts-stat:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(92,184,122,0.2);
        }
        .ts-stat:hover::before { opacity: 1; }
        .ts-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: var(--sprout);
          letter-spacing: -0.4px;
        }
        .ts-stat-label {
          font-size: 10.5px;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          letter-spacing: 1.1px;
          margin-top: 3px;
          font-weight: 500;
        }

        /* Impact items */
        .ts-impact { display: flex; flex-direction: column; gap: 18px; }
        .ts-impact-item {
          border-left: 2px solid rgba(92,184,122,0.45);
          padding-left: 16px;
          transition: border-color 0.2s;
        }
        .ts-impact-item:hover { border-color: var(--sprout); }
        .ts-impact-item h4 {
          font-size: 13.5px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }
        .ts-impact-item p {
          font-size: 12.5px;
          color: rgba(255,255,255,0.5);
          line-height: 1.65;
        }

        /* Process */
        .ts-process {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 26px;
        }
        .ts-process h4 {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 16px;
          font-weight: 600;
        }
        .ts-process ol {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          counter-reset: steps;
        }
        .ts-process ol li {
          counter-increment: steps;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.55);
          line-height: 1.55;
        }
        .ts-process ol li::before {
          content: counter(steps);
          min-width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(92,184,122,0.18);
          color: var(--sprout);
          font-size: 10.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(92,184,122,0.15);
        }

        /* ── Main content ── */
        .ts-content {
          padding: 52px 56px;
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 780px;
        }

        .ts-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 38px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--forest);
          line-height: 1.12;
          margin-bottom: 8px;
        }
        .ts-header p {
          font-size: 15px;
          color: var(--smoke);
          line-height: 1.65;
        }

        /* ── Stepper ── */
        .ts-stepper {
          display: flex;
          align-items: center;
          gap: 0;
          background: white;
          border-radius: var(--radius);
          padding: 5px;
          box-shadow: var(--shadow);
          border: 1px solid var(--line);
        }
        .ts-step {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          letter-spacing: 0.01em;
        }
        .ts-step.active {
          background: linear-gradient(145deg, var(--canopy), var(--forest));
          color: white;
          box-shadow: 0 2px 10px var(--green-glow-s);
        }
        .ts-step.done { color: var(--leaf); font-weight: 600; }
        .ts-step-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10.5px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .ts-step-badge.active { background: white; color: var(--forest); border-color: white; }
        .ts-step-badge.done {
          background: var(--leaf);
          border-color: var(--leaf);
          color: white;
          box-shadow: 0 0 6px var(--green-glow);
        }

        /* ── Card ── */
        .ts-card {
          background: white;
          border-radius: 18px;
          padding: 38px;
          box-shadow: var(--shadow);
          border: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Section title */
        .ts-section-title {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--line);
        }
        .ts-section-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: var(--mist);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: inset 0 1px 2px rgba(22,61,37,0.06);
        }
        .ts-section-h {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--forest);
        }
        .ts-section-sub {
          font-size: 13px;
          color: var(--smoke);
          margin-top: 3px;
          line-height: 1.5;
        }

        /* ── Fields ── */
        .ts-field { display: flex; flex-direction: column; gap: 6px; }
        .ts-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--earth);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .ts-req { color: var(--danger); }
        .ts-err { font-size: 12px; color: var(--danger); margin-top: 2px; font-weight: 500; }

        .ts-input, .ts-select, .ts-textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1.5px solid var(--line);
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: white;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          appearance: none;
          letter-spacing: 0.01em;
        }
        .ts-input::placeholder,
        .ts-textarea::placeholder { color: var(--muted); }
        .ts-input:focus, .ts-select:focus, .ts-textarea:focus {
          border-color: var(--leaf);
          box-shadow: 0 0 0 3px var(--green-glow);
          background: #fdfffe;
        }
        .ts-input.error, .ts-select.error {
          border-color: var(--danger);
          background: var(--danger-bg);
          box-shadow: 0 0 0 3px rgba(176,58,46,.07);
        }
        .ts-textarea {
          resize: vertical;
          min-height: 90px;
          line-height: 1.65;
        }
        .ts-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a89e93' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          padding-right: 38px;
          cursor: pointer;
        }

        .ts-row { display: grid; gap: 16px; }
        .ts-row-2 { grid-template-columns: 1fr 1fr; }
        .ts-row-3 { grid-template-columns: 1fr 1fr 1fr; }

        /* ── Map trigger ── */
        .ts-map-trigger {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 20px 22px;
          border: 2px dashed var(--line);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.22s;
          background: var(--sand);
        }
        .ts-map-trigger:hover {
          border-color: var(--leaf);
          background: var(--mist);
        }
        .ts-map-trigger.has-polygon {
          border-style: solid;
          border-color: var(--leaf);
          background: var(--mist);
          box-shadow: 0 0 0 3px var(--green-glow);
        }
        .ts-map-trigger-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(145deg, var(--canopy), var(--forest));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 2px 10px var(--green-glow-s);
        }
        .ts-map-trigger-text h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--forest);
          margin-bottom: 3px;
        }
        .ts-map-trigger-text p {
          font-size: 12.5px;
          color: var(--smoke);
          line-height: 1.5;
        }
        .ts-area-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 15px;
          background: linear-gradient(145deg, var(--canopy), var(--forest));
          color: white;
          border-radius: 100px;
          font-size: 12.5px;
          font-weight: 600;
          margin-left: auto;
          white-space: nowrap;
          box-shadow: 0 2px 8px var(--green-glow-s);
          letter-spacing: 0.01em;
        }

        /* ── Toggle group ── */
        .ts-toggle-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ts-toggle-btn {
          padding: 9px 18px;
          border-radius: 100px;
          border: 1.5px solid var(--line);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          background: white;
          color: var(--smoke);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
        }
        .ts-toggle-btn:hover {
          border-color: var(--leaf);
          color: var(--forest);
          background: var(--mist);
        }
        .ts-toggle-btn.selected {
          background: linear-gradient(145deg, var(--canopy), var(--forest));
          border-color: transparent;
          color: white;
          box-shadow: 0 2px 8px var(--green-glow-s);
        }

        /* ── Photo zone ── */
        .ts-photo-zone {
          border: 2px dashed var(--line);
          border-radius: 14px;
          padding: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.22s;
          background: var(--sand);
          text-align: center;
        }
        .ts-photo-zone:hover {
          border-color: var(--leaf);
          background: var(--mist);
        }
        .ts-photo-zone-icon { font-size: 38px; }
        .ts-photo-zone h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--forest);
        }
        .ts-photo-zone p {
          font-size: 12px;
          color: var(--smoke);
          line-height: 1.5;
        }

        .ts-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
        }
        .ts-photo-thumb {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid var(--line);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: transform 0.15s;
        }
        .ts-photo-thumb:hover { transform: scale(1.03); }
        .ts-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ts-photo-remove {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,0,0,0.65);
          color: white;
          border: none;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: background 0.15s;
        }
        .ts-photo-remove:hover { background: rgba(176,58,46,0.85); }

        /* ── Buttons ── */
        .ts-btn-row {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 10px;
          border-top: 1px solid var(--line);
        }
        .ts-btn-primary {
          padding: 12px 26px;
          background: linear-gradient(145deg, var(--canopy), var(--forest));
          color: white;
          border: none;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.2s, transform 0.12s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.02em;
          box-shadow: 0 3px 14px var(--green-glow-s), inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .ts-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 5px 20px var(--green-glow-s);
        }
        .ts-btn-primary:active:not(:disabled) { transform: scale(0.985); }
        .ts-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .ts-btn-secondary {
          padding: 12px 22px;
          background: white;
          color: var(--smoke);
          border: 1.5px solid var(--line);
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          letter-spacing: 0.01em;
        }
        .ts-btn-secondary:hover {
          border-color: var(--forest);
          color: var(--forest);
          background: var(--mist);
        }

        /* ── API error ── */
        .ts-api-error {
          padding: 12px 16px;
          background: var(--danger-bg);
          border: 1px solid rgba(176,58,46,.18);
          border-radius: 9px;
          font-size: 13px;
          color: var(--danger);
          font-weight: 500;
        }

        /* ── Spinner ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .ts-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        /* ── Success overlay ── */
        .ts-success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .ts-success-modal {
          background: white;
          border-radius: 20px;
          max-width: 480px;
          width: 100%;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .ts-success-stripe {
          height: 3px;
          background: linear-gradient(90deg, var(--forest), var(--leaf), var(--forest));
        }
        .ts-success-body {
          padding: 36px;
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        .ts-success-icon {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: linear-gradient(145deg, var(--leaf), var(--canopy));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
          box-shadow: 0 4px 18px var(--green-glow-s);
        }
        .ts-success-text h2 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--forest);
          margin-bottom: 8px;
        }
        .ts-success-text p {
          font-size: 14px;
          color: var(--smoke);
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .ts-success-actions { display: flex; gap: 10px; }

        /* ── Map modal ── */
        .ts-map-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .ts-map-modal {
          background: white;
          width: 100%;
          max-width: 920px;
          height: 88vh;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
        }
        .ts-map-header {
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
          background: white;
          gap: 12px;
        }
        .ts-map-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ts-map-header-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--mist);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .ts-map-header h3 {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--forest);
        }
        .ts-map-actions { display: flex; gap: 8px; }
        .ts-map-btn {
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid var(--line);
          background: white;
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          letter-spacing: 0.01em;
        }
        .ts-map-btn:hover { background: var(--mist); border-color: var(--leaf); color: var(--forest); }
        .ts-map-btn.primary {
          background: linear-gradient(145deg, var(--canopy), var(--forest));
          color: white;
          border-color: transparent;
          box-shadow: 0 2px 8px var(--green-glow-s);
        }
        .ts-map-btn.primary:hover { filter: brightness(1.08); }
        .ts-map-body { flex: 1; overflow: hidden; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .ts-page { grid-template-columns: 1fr; }
          .ts-sidebar { display: none; }
          .ts-content { padding: 28px 20px; }
          .ts-row-2, .ts-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ts-page">

        {/* ── SIDEBAR ── */}
        <aside className="ts-sidebar">
          <div>
            <div className="ts-sidebar-brand">
              <span className="ts-sidebar-brand-mark">🌿</span>
              Terra<span>Spotter</span>
            </div>
            <p className="ts-sidebar-tagline">Land for Green Futures</p>
          </div>

          <div className="ts-stat-row">
            {[
              { num: "2.4k", label: "Lands Mapped" },
              { num: "18k",  label: "Trees Planted" },
              { num: "340",  label: "Volunteers"    },
              { num: "62t",  label: "CO₂ Captured"  },
            ].map(s => (
              <div key={s.label} className="ts-stat">
                <div className="ts-stat-num">{s.num}</div>
                <div className="ts-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="ts-impact">
            {[
              ["Micro-climate restoration",  "Even small plantations reduce surface temperature by 2–4°C in surrounding areas."],
              ["Groundwater recharge",        "Native trees improve aquifer levels and reduce surface runoff on barren land."],
              ["Decades of carbon capture",   "Verified species selections sequester carbon continuously — not just seasonally."],
            ].map(([h, p]) => (
              <div key={h} className="ts-impact-item">
                <h4>{h}</h4>
                <p>{p}</p>
              </div>
            ))}
          </div>

          <div className="ts-process">
            <h4>What happens next</h4>
            <ol>
              <li>Boundary and area verified against satellite imagery</li>
              <li>Soil, rainfall, and climate data fetched via APIs</li>
              <li>Native tree species recommended by density</li>
              <li>Land matched with local volunteers or NGOs</li>
            </ol>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="ts-content">
          <div className="ts-header">
            <h1>Submit Land for Plantation</h1>
            <p>Mark boundaries, provide details, and upload photos to get matched with planting teams.</p>
          </div>

          {/* Stepper */}
          <div className="ts-stepper">
            {steps.map(s => (
              <div
                key={s.n}
                className={`ts-step ${step === s.n ? "active" : ""} ${step > s.n ? "done" : ""}`}
                onClick={() => step > s.n && setStep(s.n)}
              >
                <StepBadge n={s.n} active={step === s.n} done={step > s.n} />
                {s.label}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* STEP 1: Boundary */}
            {step === 1 && (
              <motion.div key="step1" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.26, ease: [0.22,1,0.36,1] }}>

                <SectionTitle icon="🗺️" title="Draw Land Boundary"
                  subtitle="Open the map and draw a polygon around the land parcel" />

                <div
                  className={`ts-map-trigger ${polygonCoords ? "has-polygon" : ""}`}
                  onClick={() => setMapOpen(true)}
                >
                  <div className="ts-map-trigger-icon">
                    {polygonCoords ? "✅" : "📍"}
                  </div>
                  <div className="ts-map-trigger-text">
                    <h4>{polygonCoords ? "Boundary drawn — click to redraw" : "Open map to draw boundary"}</h4>
                    <p>{polygonCoords
                      ? `Area: ${Number(areaSqm).toLocaleString()} m² · Centroid: ${centroid?.lat.toFixed(5)}, ${centroid?.lng.toFixed(5)}`
                      : "Use the polygon tool to mark the exact parcel"}</p>
                  </div>
                  {polygonCoords && (
                    <span className="ts-area-pill">📐 {Number(areaSqm).toLocaleString()} m²</span>
                  )}
                </div>

                {errors.polygon && <p className="ts-err">{errors.polygon}</p>}

                <div className="ts-row ts-row-2">
                  <Field label="Land Title">
                    <input className="ts-input" placeholder="e.g. Nanded Highway Plot"
                      value={title} onChange={e => setTitle(e.target.value)} />
                  </Field>
                  <Field label="Brief Description">
                    <input className="ts-input" placeholder="Optional overview"
                      value={description} onChange={e => setDescription(e.target.value)} />
                  </Field>
                </div>

                <div className="ts-btn-row">
                  <button className="ts-btn-primary" onClick={nextStep}>
                    Continue to Owner Info →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Owner */}
            {step === 2 && (
              <motion.div key="step2" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.26, ease: [0.22,1,0.36,1] }}>

                <SectionTitle icon="👤" title="Owner & Contact"
                  subtitle="Who owns this land and do they permit plantation?" />

                <div className="ts-row ts-row-2">
                  <Field label="Owner Name" required error={errors.ownerName}>
                    <input className={`ts-input${errors.ownerName ? " error" : ""}`}
                      placeholder="Full name"
                      value={owner.name} onChange={e => setOwner({ ...owner, name: e.target.value })} />
                  </Field>
                  <Field label="Phone Number" required error={errors.ownerPhone}>
                    <input className={`ts-input${errors.ownerPhone ? " error" : ""}`}
                      placeholder="10-digit mobile"
                      value={owner.phone} onChange={e => setOwner({ ...owner, phone: e.target.value })} />
                  </Field>
                </div>

                <Field label="Email Address">
                  <input className="ts-input" type="email" placeholder="owner@example.com"
                    value={owner.email} onChange={e => setOwner({ ...owner, email: e.target.value })} />
                </Field>

                <div className="ts-row ts-row-2">
                  <Field label="Ownership Type" required error={errors.ownershipType}>
                    <select className={`ts-select${errors.ownershipType ? " error" : ""}`}
                      value={owner.ownershipType}
                      onChange={e => setOwner({ ...owner, ownershipType: e.target.value })}>
                      <option value="">Select type</option>
                      <option>Private</option>
                      <option>Government</option>
                      <option>Trust / NGO</option>
                      <option>Panchayat</option>
                      <option>Religious Body</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Permission to Plant?" required error={errors.permission}>
                    <select className={`ts-select${errors.permission ? " error" : ""}`}
                      value={owner.permission}
                      onChange={e => setOwner({ ...owner, permission: e.target.value })}>
                      <option value="">Select status</option>
                      <option>Yes — confirmed in writing</option>
                      <option>Yes — verbal agreement</option>
                      <option>Pending approval</option>
                      <option>No</option>
                    </select>
                  </Field>
                </div>

                <div className="ts-btn-row">
                  <button className="ts-btn-secondary" onClick={prevStep}>← Back</button>
                  <button className="ts-btn-primary" onClick={nextStep}>Continue to Land Details →</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Land Info */}
            {step === 3 && (
              <motion.div key="step3" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.26, ease: [0.22,1,0.36,1] }}>

                <SectionTitle icon="🌍" title="Land Details"
                  subtitle="Physical characteristics and current condition of the land" />

                <div className="ts-row ts-row-2">
                  <Field label="Land Status" required error={errors.landStatus}>
                    <select className={`ts-select${errors.landStatus ? " error" : ""}`}
                      value={land.status} onChange={e => setLand({ ...land, status: e.target.value })}>
                      <option value="">Select status</option>
                      <option>Vacant</option>
                      <option>Barren</option>
                      <option>Roadside Strip</option>
                      <option>Open Ground</option>
                      <option>Agricultural (unused)</option>
                      <option>Industrial Wasteland</option>
                    </select>
                  </Field>
                  <Field label="Soil Type">
                    <select className="ts-select" value={land.soilType}
                      onChange={e => setLand({ ...land, soilType: e.target.value })}>
                      <option value="">Select soil type</option>
                      <option>Black cotton soil</option>
                      <option>Red laterite</option>
                      <option>Alluvial</option>
                      <option>Sandy</option>
                      <option>Rocky / Gravelly</option>
                      <option>Unknown</option>
                    </select>
                  </Field>
                </div>

                <div className="ts-row ts-row-2">
                  <Field label="Water Availability" required error={errors.waterAvailable}>
                    <select className={`ts-select${errors.waterAvailable ? " error" : ""}`}
                      value={land.waterAvailable}
                      onChange={e => setLand({ ...land, waterAvailable: e.target.value })}>
                      <option value="">Select</option>
                      <option>Yes — borewell</option>
                      <option>Yes — canal / river nearby</option>
                      <option>Seasonal only</option>
                      <option>No</option>
                    </select>
                  </Field>
                  <Field label="Watering Frequency" required error={errors.waterFrequency}>
                    <select className={`ts-select${errors.waterFrequency ? " error" : ""}`}
                      value={land.waterFrequency}
                      onChange={e => setLand({ ...land, waterFrequency: e.target.value })}>
                      <option value="">Select</option>
                      <option>Daily</option>
                      <option>Alternate days</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Irregular</option>
                    </select>
                  </Field>
                </div>

                <div className="ts-row ts-row-2">
                  <Field label="Road Access">
                    <select className="ts-select" value={land.accessRoad}
                      onChange={e => setLand({ ...land, accessRoad: e.target.value })}>
                      <option value="">Select</option>
                      <option>Direct road access</option>
                      <option>Nearby (within 500m)</option>
                      <option>Remote / no access road</option>
                    </select>
                  </Field>
                  <Field label="Nearby Landmark">
                    <input className="ts-input" placeholder="e.g. Near Nanded Bus Stand"
                      value={land.nearbyLandmark}
                      onChange={e => setLand({ ...land, nearbyLandmark: e.target.value })} />
                  </Field>
                </div>

                <Field label="Fencing">
                  <div className="ts-toggle-group">
                    {["Yes", "No", "Partial"].map(v => (
                      <button key={v}
                        className={`ts-toggle-btn${land.fencing === v ? " selected" : ""}`}
                        onClick={() => setLand({ ...land, fencing: v })}>
                        {v}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Additional Notes">
                  <textarea className="ts-textarea"
                    placeholder="Any special conditions, hazards, or details the planting team should know…"
                    value={land.notes}
                    onChange={e => setLand({ ...land, notes: e.target.value })} />
                </Field>

                <div className="ts-btn-row">
                  <button className="ts-btn-secondary" onClick={prevStep}>← Back</button>
                  <button className="ts-btn-primary" onClick={nextStep}>Continue to Photos →</button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Photos */}
            {step === 4 && (
              <motion.div key="step4" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.26, ease: [0.22,1,0.36,1] }}>

                <SectionTitle icon="📸" title="Land Photos"
                  subtitle="Upload at least 3 clear photos — different angles help volunteers assess the site" />

                <label>
                  <div className="ts-photo-zone">
                    <div className="ts-photo-zone-icon">📂</div>
                    <h4>Click to choose photos</h4>
                    <p>JPG, PNG, WEBP · Max 20MB per file · Min 3 required</p>
                    <input type="file" multiple accept="image/*" hidden onChange={handleFileChange} />
                  </div>
                </label>

                {errors.files && <p className="ts-err">{errors.files}</p>}

                {previews.length > 0 && (
                  <div className="ts-photo-grid">
                    {previews.map((url, i) => (
                      <div key={i} className="ts-photo-thumb">
                        <img src={url} alt={`preview-${i}`} />
                        <button className="ts-photo-remove" onClick={() => removeFile(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: 13, color: "var(--smoke)" }}>
                  {files.length} photo{files.length !== 1 ? "s" : ""} selected
                  {files.length > 0 && files.length < 3 && (
                    <span style={{ color: "var(--danger)", fontWeight: 500 }}> — {3 - files.length} more required</span>
                  )}
                  {files.length >= 3 && (
                    <span style={{ color: "var(--leaf)", fontWeight: 600 }}> ✓ Minimum met</span>
                  )}
                </p>

                {errors.api && <div className="ts-api-error">{errors.api}</div>}

                <div className="ts-btn-row">
                  <button className="ts-btn-secondary" onClick={prevStep}>← Back</button>
                  <button className="ts-btn-primary" onClick={submitLand} disabled={submitting}>
                    {submitting
                      ? <><div className="ts-spinner" /> Submitting…</>
                      : "Submit Land 🌱"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ── MAP MODAL ── */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div className="ts-map-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setMapOpen(false)}>
            <motion.div className="ts-map-modal"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22,1,0.36,1] }}>

              <div className="ts-map-header">
                <div className="ts-map-header-left">
                  <div className="ts-map-header-icon">📍</div>
                  <h3>Draw Land Boundary</h3>
                </div>
                <div className="ts-map-actions">
                  <button className="ts-map-btn" onClick={locateUser}>📍 Locate me</button>
                  {polygonCoords && (
                    <button className="ts-map-btn primary" onClick={() => setMapOpen(false)}>
                      ✓ Confirm boundary
                    </button>
                  )}
                  <button className="ts-map-btn" onClick={() => setMapOpen(false)}>Close</button>
                </div>
              </div>

              <div className="ts-map-body">
                <MapContainer
                  center={[18.6725, 77.3013]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  ref={mapRef}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                      }}
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