import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const Main = () => {
  /* ================= AUTH ================= */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= MAP ================= */
  const [mapOpen, setMapOpen] = useState(false);
  const mapRef = useRef(null);
  const locationLayerRef = useRef(null);

  /* ================= LAND GEOMETRY ================= */
  const [polygonCoords, setPolygonCoords] = useState(null);
  const [centroid, setCentroid] = useState(null);
  const [areaSqm, setAreaSqm] = useState(null);

  /* ================= FORM DATA ================= */
  const [owner, setOwner] = useState({
    name: "",
    phone: "",
    ownershipType: "",
    permission: "",
  });

  const [land, setLand] = useState({
    status: "",
    accessRoad: "",
    waterAvailable: "",
    waterFrequency: "",
    fencing: "",
    notes: "",
  });

  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  /* ================= SESSION ================= */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/auth/session",
          { withCredentials: true }
        );
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  /* ================= MAP SIZE FIX ================= */
  useEffect(() => {
    if (mapOpen && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  }, [mapOpen]);

  /* ================= GPS ================= */
  const locateUser = () => {
    if (!mapRef.current) return;

    mapRef.current.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    });

    mapRef.current.on("locationfound", (e) => {
      const { latlng, accuracy } = e;

      if (locationLayerRef.current) {
        mapRef.current.removeLayer(locationLayerRef.current);
      }

      const marker = L.marker(latlng);
      const circle = L.circle(latlng, { radius: accuracy });

      locationLayerRef.current = L.layerGroup([marker, circle]);
      locationLayerRef.current.addTo(mapRef.current);
    });

    mapRef.current.on("locationerror", () => {
      alert("Unable to access location. Allow GPS permission.");
    });
  };

  /* ================= POLYGON ================= */
  const onPolygonCreated = (e) => {
    const latlngs = e.layer.getLatLngs()[0];

    // Full polygon coordinates
    const coords = latlngs.map((p) => ({
      lat: p.lat,
      lng: p.lng,
    }));
    setPolygonCoords(coords);

    // Area in SQM
    const area = L.GeometryUtil.geodesicArea(latlngs);
    setAreaSqm(area.toFixed(2));

    // Centroid
    const centerLat =
      latlngs.reduce((sum, p) => sum + p.lat, 0) / latlngs.length;
    const centerLng =
      latlngs.reduce((sum, p) => sum + p.lng, 0) / latlngs.length;

    setCentroid({ lat: centerLat, lng: centerLng });

    mapRef.current.flyTo([centerLat, centerLng], 15);
  };

  /* ================= FILE UPLOAD ================= */
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  /* ================= SUBMIT ================= */
  const submitLand = () => {
    if (
      !polygonCoords ||
      !areaSqm ||
      !owner.name ||
      !owner.phone ||
      !owner.permission ||
      !land.status ||
      !land.waterAvailable ||
      !land.waterFrequency ||
      files.length < 3
    ) {
      alert("Please complete all required fields");
      return;
    }

    const payload = {
      polygonCoords,
      centroid,
      areaSqm,
      owner,
      land,
      description,
      imagesCount: files.length,
    };

    console.log("FINAL SUBMISSION:", payload);
    alert("Land submitted successfully");
  };

  if (loading) return <div className="p-10 text-center">Loading…</div>;

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT – INFO */}
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="relative overflow-hidden rounded-xl shadow bg-gradient-to-br from-emerald-900 via-green-800 to-green-900 p-8 text-white"
>
  {/* Background texture */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/20 rounded-full blur-3xl" />

  <div className="relative z-10 flex flex-col h-full justify-between">
    {/* Top */}
    <div>
      <p className="text-xs uppercase tracking-widest text-green-300 mb-3">
        Plantation insight
      </p>

      <h1 className="text-4xl font-bold leading-tight mb-4">
        Every marked land <br />becomes a living system
      </h1>

      <p className="text-green-100 leading-relaxed mb-6">
        Plantation is not about planting trees alone.  
        It is about restoring soil health, improving water retention,
        reducing local heat, and rebuilding ecological balance.
      </p>

      {/* Impact points */}
      <div className="space-y-4">
        <div className="border-l-2 border-green-400 pl-4">
          <p className="text-sm font-semibold">Micro-climate improvement</p>
          <p className="text-sm text-green-200">
            Even small plantations reduce surface temperature and increase
            humidity in surrounding areas.
          </p>
        </div>

        <div className="border-l-2 border-green-400 pl-4">
          <p className="text-sm font-semibold">Water resilience</p>
          <p className="text-sm text-green-200">
            Trees improve groundwater recharge and reduce surface runoff,
            especially in open and barren lands.
          </p>
        </div>

        <div className="border-l-2 border-green-400 pl-4">
          <p className="text-sm font-semibold">Long-term carbon capture</p>
          <p className="text-sm text-green-200">
            Native species plantations sequester carbon continuously
            over decades, not just seasons.
          </p>
        </div>
      </div>
    </div>

    {/* Bottom process */}
    <div className="mt-8 border-t border-white/20 pt-4">
      <p className="text-sm text-green-200 mb-3">
        What happens after you submit land:
      </p>

      <ol className="text-sm text-green-100 space-y-2 list-decimal list-inside">
        <li>Boundary and area are verified</li>
        <li>Soil, rainfall, and climate data are fetched via APIs</li>
        <li>Tree species and density are recommended</li>
        <li>Land is matched with volunteers or organizations</li>
      </ol>

      <p className="text-xs text-green-300 mt-4">
        Data-driven. Transparent. Community-verified.
      </p>
    </div>
  </div>
</motion.div>


        {/* RIGHT – FORM */}
        <div className="bg-white rounded-xl shadow p-8 space-y-4">

          <div>
            <label className="text-sm">Area (sqm)</label>
            <input
              readOnly
              value={areaSqm || "No land selected"}
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>

          <button
            onClick={() => setMapOpen(true)}
            className="w-full border border-green-700 text-green-700 py-2 rounded hover:bg-green-50"
          >
            Select land on map
          </button>

          <h3 className="font-medium mt-4">Owner / Contact</h3>
          <input
            placeholder="Owner name"
            className="w-full p-2 border rounded"
            onChange={(e) => setOwner({ ...owner, name: e.target.value })}
          />
          <input
            placeholder="Mobile number"
            className="w-full p-2 border rounded"
            onChange={(e) => setOwner({ ...owner, phone: e.target.value })}
          />

          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setOwner({ ...owner, ownershipType: e.target.value })
            }
          >
            <option value="">Ownership type</option>
            <option>Private</option>
            <option>Government</option>
            <option>Trust / NGO</option>
            <option>Other</option>
          </select>

          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setOwner({ ...owner, permission: e.target.value })
            }
          >
            <option value="">Permission to plant?</option>
            <option>Yes</option>
            <option>No</option>
            <option>Pending</option>
          </select>

          <h3 className="font-medium mt-4">Land Details</h3>

          <select
            className="w-full p-2 border rounded"
            onChange={(e) => setLand({ ...land, status: e.target.value })}
          >
            <option value="">Land status</option>
            <option>Vacant</option>
            <option>Barren</option>
            <option>Roadside</option>
            <option>Open Ground</option>
          </select>

          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setLand({ ...land, waterAvailable: e.target.value })
            }
          >
            <option value="">Water availability</option>
            <option>Yes</option>
            <option>No</option>
            <option>Seasonal</option>
          </select>

          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setLand({ ...land, waterFrequency: e.target.value })
            }
          >
            <option value="">Water frequency</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Irregular</option>
          </select>

          <textarea
            placeholder="Additional notes (optional)"
            rows={3}
            className="w-full p-2 border rounded"
            onChange={(e) => setLand({ ...land, notes: e.target.value })}
          />

          <label className="block mt-3 text-sm">Upload Images (min 3)</label>
          <label className="flex items-center justify-center border rounded p-2 cursor-pointer hover:bg-gray-50">
            Choose files
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </label>
          <p className="text-sm text-gray-500">{files.length} file(s) selected</p>

          <button
            onClick={submitLand}
            className="w-full bg-green-700 text-white py-3 rounded hover:bg-green-800"
          >
            Submit Land
          </button>
        </div>
      </div>

      {/* MAP MODAL */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-4xl h-[85vh] rounded-xl p-4 flex flex-col"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Select Land</h3>
                <button onClick={() => setMapOpen(false)}>Close</button>
              </div>

              <button
                onClick={locateUser}
                className="mb-2 px-3 py-1 border rounded text-sm"
              >
                📍 Locate me
              </button>

              <div className="flex-1 overflow-hidden rounded">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                  whenCreated={(map) => (mapRef.current = map)}
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
    </main>
  );
};

export default Main;
