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
// tiny helpers
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

// main component
const Main = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=map, 2=owner, 3=land, 4=photos
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  /* map */
  const [mapOpen, setMapOpen] = useState(false);
  const mapRef = useRef(null);
  const locationLayerRef = useRef(null);

  /* geometry */
  const [polygonCoords, setPolygonCoords] = useState(null);
  const [centroid, setCentroid] = useState(null);
  const [areaSqm, setAreaSqm] = useState(null);

  /* form */
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

  /* session */
  useEffect(() => {
    axios.get(`${BASE_URL}/api/auth/session`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /* map size fix */
  useEffect(() => {
    if (mapOpen && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 300);
    }
  }, [mapOpen]);

  /* file previews */
  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  /* GPS */
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

  /* polygon */
  const onPolygonCreated = (e) => {
    const latlngs = e.layer.getLatLngs()[0];
    setPolygonCoords(latlngs.map(p => ({ lat: p.lat, lng: p.lng })));
    setAreaSqm(L.GeometryUtil.geodesicArea(latlngs).toFixed(2));
    const lat = latlngs.reduce((s, p) => s + p.lat, 0) / latlngs.length;
    const lng = latlngs.reduce((s, p) => s + p.lng, 0) / latlngs.length;
    setCentroid({ lat, lng });
    mapRef.current.flyTo([lat, lng], 15);
  };

  /* file change */
  const handleFileChange = (e) => setFiles([...e.target.files]);

  const removeFile = (i) => {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
  };

  /* validate per step */
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

  /* submit */
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

  if (loading) return (
   <LoadingSpinner text="Loading workspace..." />
  );

  if (submitted) return (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={() => {
      setSubmitted(false);
      setStep(1);
      setPolygonCoords(null);
      setAreaSqm(null);
      setFiles([]);
    }}
  >
    <div
      className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl text-white shadow-md">
          🌱
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 text-center sm:text-left">
        
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Land Submitted
        </h2>

        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          Thanks for your contribution. Every small step helps in building a greener and more sustainable future 🌿
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setPolygonCoords(null);
              setAreaSqm(null);
              setFiles([]);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            Close
          </button>

          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setPolygonCoords(null);
              setAreaSqm(null);
              setFiles([]);
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
          >
            + Add Another
          </button>
        </div>

      </div>
    </div>
  </div>
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
        /* Google Font */
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest:   #0d3320;
          --canopy:   #1a5c38;
          --leaf:     #2d8a55;
          --sprout:   #4db87a;
          --mist:     #e8f5ee;
          --earth:    #3d2b1f;
          --sand:     #f7f3ee;
          --bark:     #8b6f5c;
          --ink:      #1a1a1a;
          --smoke:    #6b7280;
          --line:     #e2e8f0;
          --danger:   #dc2626;
          --white:    #ffffff;
          --radius:   12px;
          --shadow:   0 4px 24px rgba(13,51,32,0.10);
          --shadow-lg:0 12px 48px rgba(13,51,32,0.16);
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--sand); color: var(--ink); }

        /* page */
        .ts-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 380px 1fr;
          grid-template-rows: auto 1fr;
        }

        /* sidebar */
        .ts-sidebar {
          grid-column: 1;
          grid-row: 1 / 3;
          background: var(--forest);
          color: white;
          padding: 48px 36px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .ts-sidebar-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          letter-spacing: -0.5px;
          color: white;
        }
        .ts-sidebar-brand span { color: var(--sprout); }

        .ts-sidebar-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: -28px;
        }

        .ts-impact {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ts-impact-item {
          border-left: 2px solid var(--sprout);
          padding-left: 16px;
        }
        .ts-impact-item h4 {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }
        .ts-impact-item p {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
        }

        .ts-stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ts-stat {
          background: rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .ts-stat-num {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: var(--sprout);
        }
        .ts-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }

        .ts-process {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 28px;
        }
        .ts-process h4 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 16px;
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
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
        }
        .ts-process ol li::before {
          content: counter(steps);
          min-width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(77,184,122,0.2);
          color: var(--sprout);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }

        /* main content */
        .ts-content {
          grid-column: 2;
          grid-row: 1 / 3;
          padding: 48px 52px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 760px;
        }

        .ts-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ts-header h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          letter-spacing: -0.5px;
          color: var(--forest);
          line-height: 1.15;
        }
        .ts-header p {
          font-size: 15px;
          color: var(--smoke);
        }

        /* stepper */
        .ts-stepper {
          display: flex;
          align-items: center;
          gap: 0;
          background: white;
          border-radius: var(--radius);
          padding: 6px;
          box-shadow: var(--shadow);
          border: 1px solid var(--line);
        }
        .ts-step {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 13px;
          font-weight: 500;
          color: var(--smoke);
        }
        .ts-step.active { background: var(--forest); color: white; }
        .ts-step.done { color: var(--leaf); }

        .ts-step-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .ts-step-badge.active { background: white; color: var(--forest); border-color: white; }
        .ts-step-badge.done { background: var(--leaf); border-color: var(--leaf); color: white; }

        /* card */
        .ts-card {
          background: white;
          border-radius: 16px;
          padding: 36px;
          box-shadow: var(--shadow);
          border: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* section title */
        .ts-section-title {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--line);
        }
        .ts-section-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--mist);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .ts-section-h {
          font-size: 17px;
          font-weight: 600;
          color: var(--forest);
        }
        .ts-section-sub {
          font-size: 13px;
          color: var(--smoke);
          margin-top: 2px;
        }

        /* field */
        .ts-field { display: flex; flex-direction: column; gap: 6px; }
        .ts-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--earth);
          letter-spacing: 0.2px;
        }
        .ts-req { color: var(--danger); }
        .ts-err { font-size: 12px; color: var(--danger); margin-top: 2px; }

        .ts-input, .ts-select, .ts-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--line);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          appearance: none;
        }
        .ts-input:focus, .ts-select:focus, .ts-textarea:focus {
          border-color: var(--leaf);
          box-shadow: 0 0 0 3px rgba(45,138,85,0.10);
        }
        .ts-input.error, .ts-select.error { border-color: var(--danger); }
        .ts-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }
        .ts-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
        }

        .ts-row { display: grid; gap: 16px; }
        .ts-row-2 { grid-template-columns: 1fr 1fr; }
        .ts-row-3 { grid-template-columns: 1fr 1fr 1fr; }

        /* map trigger */
        .ts-map-trigger {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border: 2px dashed var(--line);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--sand);
        }
        .ts-map-trigger:hover { border-color: var(--leaf); background: var(--mist); }
        .ts-map-trigger.has-polygon { border-style: solid; border-color: var(--leaf); background: var(--mist); }
        .ts-map-trigger-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--forest);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .ts-map-trigger-text h4 { font-size: 14px; font-weight: 600; color: var(--forest); }
        .ts-map-trigger-text p { font-size: 12px; color: var(--smoke); margin-top: 2px; }

        .ts-area-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--forest);
          color: white;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        /* toggle group */
        .ts-toggle-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ts-toggle-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1.5px solid var(--line);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          background: white;
          color: var(--smoke);
          font-family: 'DM Sans', sans-serif;
        }
        .ts-toggle-btn.selected {
          background: var(--forest);
          border-color: var(--forest);
          color: white;
        }

        /* photo upload */
        .ts-photo-zone {
          border: 2px dashed var(--line);
          border-radius: 12px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--sand);
          text-align: center;
        }
        .ts-photo-zone:hover { border-color: var(--leaf); background: var(--mist); }
        .ts-photo-zone-icon { font-size: 36px; }
        .ts-photo-zone h4 { font-size: 14px; font-weight: 600; color: var(--forest); }
        .ts-photo-zone p { font-size: 12px; color: var(--smoke); }

        .ts-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
        }
        .ts-photo-thumb {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1.5px solid var(--line);
        }
        .ts-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ts-photo-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        /* buttons */
        .ts-btn-row {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid var(--line);
        }
        .ts-btn-primary {
          padding: 12px 28px;
          background: var(--forest);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ts-btn-primary:hover { background: var(--canopy); }
        .ts-btn-primary:active { transform: scale(0.98); }
        .ts-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .ts-btn-secondary {
          padding: 12px 24px;
          background: white;
          color: var(--forest);
          border: 1.5px solid var(--line);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .ts-btn-secondary:hover { border-color: var(--forest); }

        /* loader */
        .ts-loader {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: var(--sand);
          font-size: 14px;
          color: var(--smoke);
        }
        .ts-loader-ring {
          width: 36px;
          height: 36px;
          border: 3px solid var(--line);
          border-top-color: var(--forest);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* success */
        .ts-success-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--sand);
          padding: 24px;
        }
        .ts-success-card {
          background: white;
          border-radius: 20px;
          padding: 52px 48px;
          box-shadow: var(--shadow-lg);
          text-align: center;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .ts-success-icon { font-size: 56px; }
        .ts-success-card h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: var(--forest);
        }
        .ts-success-card p { font-size: 14px; color: var(--smoke); line-height: 1.7; }

        /* map modal */
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
          max-width: 900px;
          height: 88vh;
          border-radius: 18px;
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
        }
        .ts-map-header h3 { font-size: 16px; font-weight: 600; color: var(--forest); }
        .ts-map-actions { display: flex; gap: 8px; }
        .ts-map-btn {
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid var(--line);
          background: white;
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .ts-map-btn:hover { background: var(--mist); border-color: var(--leaf); }
        .ts-map-btn.primary { background: var(--forest); color: white; border-color: var(--forest); }
        .ts-map-btn.primary:hover { background: var(--canopy); }
        .ts-map-body { flex: 1; overflow: hidden; }

        /* api error */
        .ts-api-error {
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
          color: var(--danger);
        }

        /* responsive */
        @media (max-width: 900px) {
          .ts-page { grid-template-columns: 1fr; }
          .ts-sidebar { display: none; }
          .ts-content { padding: 24px 20px; }
          .ts-row-2, .ts-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ts-page">
        {/* SIDEBAR */}
        <aside className="ts-sidebar">
          <div>
            <div className="ts-sidebar-brand">Terra<span>Spotter</span></div>
            
            <p className="ts-sidebar-tagline">Land for Green Futures</p>
          </div>

          <div className="ts-stat-row">
            <div className="ts-stat">
              <div className="ts-stat-num">2.4k</div>
              <div className="ts-stat-label">Lands Mapped</div>
            </div>
            <div className="ts-stat">
              <div className="ts-stat-num">18k</div>
              <div className="ts-stat-label">Trees Planted</div>
            </div>
            <div className="ts-stat">
              <div className="ts-stat-num">340</div>
              <div className="ts-stat-label">Volunteers</div>
            </div>
            <div className="ts-stat">
              <div className="ts-stat-num">62t</div>
              <div className="ts-stat-label">CO₂ Captured</div>
            </div>
          </div>

          <div className="ts-impact">
            <div className="ts-impact-item">
              <h4>Micro-climate restoration</h4>
              <p>Even small plantations reduce surface temperature by 2–4°C in surrounding areas.</p>
            </div>
            <div className="ts-impact-item">
              <h4>Groundwater recharge</h4>
              <p>Native trees improve aquifer levels and reduce surface runoff on barren land.</p>
            </div>
            <div className="ts-impact-item">
              <h4>Decades of carbon capture</h4>
              <p>Verified species selections sequester carbon continuously — not just seasonally.</p>
            </div>
          </div>

          <div className="ts-process">
            <h4>What happens next</h4>
            <ol>
              <li>Boundary and area are verified against satellite imagery</li>
              <li>Soil, rainfall, and climate data fetched via APIs</li>
              <li>Native tree species recommended by density</li>
              <li>Land matched with local volunteers or NGOs</li>
            </ol>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="ts-content">
          <div className="ts-header">
            <h1>Submit Land for Plantation</h1>
            <p>Mark boundaries, provide details, and upload photos to get matched with planting teams.</p>
          </div>

          {/* stepper */}
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
            {/* STEP 1: MAP */}
            {step === 1 && (
              <motion.div key="step1" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionTitle icon="🗺️" title="Draw Land Boundary" subtitle="Open the map and draw a polygon around the land parcel" />

                <div
                  className={`ts-map-trigger ${polygonCoords ? "has-polygon" : ""}`}
                  onClick={() => setMapOpen(true)}
                >
                  <div className="ts-map-trigger-icon">
                    {polygonCoords ? "✅" : "📍"}
                  </div>
                  <div className="ts-map-trigger-text">
                    <h4>{polygonCoords ? "Boundary drawn — click to redraw" : "Open map to draw boundary"}</h4>
                    <p>{polygonCoords ? `Area: ${Number(areaSqm).toLocaleString()} m² · Centroid: ${centroid?.lat.toFixed(5)}, ${centroid?.lng.toFixed(5)}` : "Use the polygon tool to mark the exact parcel"}</p>
                  </div>
                  {polygonCoords && <span className="ts-area-pill">📐 {Number(areaSqm).toLocaleString()} m²</span>}
                </div>

                {errors.polygon && <p className="ts-err">{errors.polygon}</p>}

                <div className="ts-row ts-row-2">
                  <Field label="Land Title" >
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

            {/* STEP 2: OWNER */}
            {step === 2 && (
              <motion.div key="step2" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionTitle icon="👤" title="Owner & Contact" subtitle="Who owns this land and do they permit plantation?" />

                <div className="ts-row ts-row-2">
                  <Field label="Owner Name" required error={errors.ownerName}>
                    <input className={`ts-input ${errors.ownerName ? "error" : ""}`}
                      placeholder="Full name"
                      value={owner.name} onChange={e => setOwner({ ...owner, name: e.target.value })} />
                  </Field>
                  <Field label="Phone Number" required error={errors.ownerPhone}>
                    <input className={`ts-input ${errors.ownerPhone ? "error" : ""}`}
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
                    <select className={`ts-select ${errors.ownershipType ? "error" : ""}`}
                      value={owner.ownershipType} onChange={e => setOwner({ ...owner, ownershipType: e.target.value })}>
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
                    <select className={`ts-select ${errors.permission ? "error" : ""}`}
                      value={owner.permission} onChange={e => setOwner({ ...owner, permission: e.target.value })}>
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

            {/* STEP 3: LAND INFO */}
            {step === 3 && (
              <motion.div key="step3" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionTitle icon="🌍" title="Land Details" subtitle="Physical characteristics and current condition of the land" />

                <div className="ts-row ts-row-2">
                  <Field label="Land Status" required error={errors.landStatus}>
                    <select className={`ts-select ${errors.landStatus ? "error" : ""}`}
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
                    <select className={`ts-select ${errors.waterAvailable ? "error" : ""}`}
                      value={land.waterAvailable} onChange={e => setLand({ ...land, waterAvailable: e.target.value })}>
                      <option value="">Select</option>
                      <option>Yes — borewell</option>
                      <option>Yes — canal / river nearby</option>
                      <option>Seasonal only</option>
                      <option>No</option>
                    </select>
                  </Field>
                  <Field label="Watering Frequency" required error={errors.waterFrequency}>
                    <select className={`ts-select ${errors.waterFrequency ? "error" : ""}`}
                      value={land.waterFrequency} onChange={e => setLand({ ...land, waterFrequency: e.target.value })}>
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
                      value={land.nearbyLandmark} onChange={e => setLand({ ...land, nearbyLandmark: e.target.value })} />
                  </Field>
                </div>

                <Field label="Fencing">
                  <div className="ts-toggle-group">
                    {["Yes", "No", "Partial"].map(v => (
                      <button key={v} className={`ts-toggle-btn ${land.fencing === v ? "selected" : ""}`}
                        onClick={() => setLand({ ...land, fencing: v })}>
                        {v}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Additional Notes">
                  <textarea className="ts-textarea"
                    placeholder="Any special conditions, hazards, or details the planting team should know…"
                    value={land.notes} onChange={e => setLand({ ...land, notes: e.target.value })} />
                </Field>

                <div className="ts-btn-row">
                  <button className="ts-btn-secondary" onClick={prevStep}>← Back</button>
                  <button className="ts-btn-primary" onClick={nextStep}>Continue to Photos →</button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PHOTOS */}
            {step === 4 && (
              <motion.div key="step4" className="ts-card"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionTitle icon="📸" title="Land Photos" subtitle="Upload at least 3 clear photos — different angles help volunteers assess the site" />

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
                  {files.length > 0 && files.length < 3 && <span style={{ color: "var(--danger)" }}> — {3 - files.length} more required</span>}
                  {files.length >= 3 && <span style={{ color: "var(--leaf)" }}> ✓ Minimum met</span>}
                </p>

                {errors.api && <div className="ts-api-error">{errors.api}</div>}

                <div className="ts-btn-row">
                  <button className="ts-btn-secondary" onClick={prevStep}>← Back</button>
                  <button className="ts-btn-primary" onClick={submitLand} disabled={submitting}>
                    {submitting ? (
                      <><div className="ts-loader-ring" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting…</>
                    ) : "Submit Land 🌱"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* MAP MODAL */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div className="ts-map-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setMapOpen(false)}>
            <motion.div className="ts-map-modal"
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}>
              <div className="ts-map-header">
                <h3>📍 Draw Land Boundary</h3>
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