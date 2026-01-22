import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

/* ================= DUMMY DATA ================= */
const lands = [
  {
    id: 1,
    name: "Open Ground near Village A",
    location: "Nashik, Maharashtra",
    lat: 19.9975,
    lng: 73.7898,
    areaSqm: 5200,
    approxTrees: 260,
    landStatus: "Vacant",
    water: "Yes",
    weather: "Semi-arid",
  },
  {
    id: 2,
    name: "Roadside Patch",
    location: "Pune, Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    areaSqm: 1800,
    approxTrees: 70,
    landStatus: "Roadside",
    water: "Seasonal",
    weather: "Moderate",
  },
  {
    id: 3,
    name: "Barren Community Land",
    location: "Aurangabad, Maharashtra",
    lat: 19.8762,
    lng: 75.3433,
    areaSqm: 9500,
    approxTrees: 420,
    landStatus: "Barren",
    water: "No",
    weather: "Dry",
  },
];

/* ================= DISTANCE UTILITY ================= */
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ================= COMPONENT ================= */
const Browse = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  // THIS is the important state
  const [pinLocation, setPinLocation] = useState(null);

  /* ================= FILTER LOGIC ================= */
  const filteredLands = lands.filter((land) => {
    const keywordMatch =
      land.name.toLowerCase().includes(search.toLowerCase()) ||
      land.location.toLowerCase().includes(search.toLowerCase());

    const filterMatch = activeFilter
      ? land.landStatus === activeFilter
      : true;

    // Use returned coordinates here
    const pinMatch = pinLocation
      ? distanceKm(
          pinLocation.lat,
          pinLocation.lng,
          land.lat,
          land.lng
        ) <= 50
      : true;

    return keywordMatch && filterMatch && pinMatch;
  });

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">
          Browse Plantation Locations
        </h1>
        <p className="text-gray-600 mb-6">
          Search by keyword or drop a pin to find nearby plantation sites.
        </p>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by land name or location"
            className="flex-1 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setMapOpen(true)}
            title="Search using map pin"
          >
            <FaMapMarkerAlt className="text-green-700 text-xl" />
          </button>
        </div>

        {/* PIN INFO */}
        {pinLocation && (
          <div className="mb-6 text-sm text-green-800 bg-green-100 px-4 py-2 rounded">
            Searching within 50 km of:
            <span className="font-medium ml-2">
              {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)}
            </span>
          </div>
        )}

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {["Vacant", "Roadside", "Barren"].map((type) => (
            <button
              key={type}
              onClick={() =>
                setActiveFilter(activeFilter === type ? "" : type)
              }
              className={`px-4 py-2 rounded-full border text-sm font-medium transition
                ${
                  activeFilter === type
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              {type}
            </button>
          ))}

          {pinLocation && (
            <button
              onClick={() => setPinLocation(null)}
              className="px-4 py-2 rounded-full text-sm bg-gray-200 hover:bg-gray-300"
            >
              Clear location
            </button>
          )}
        </div>

        {/* RESULTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLands.map((land) => (
            <motion.div
              key={land.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow overflow-hidden"
            >
              <div className="h-36 bg-gradient-to-br from-green-200 to-green-300 flex items-center justify-center">
                <span className="text-green-900 font-semibold">
                  {land.landStatus} Land
                </span>
              </div>

              <div className="p-5">
                <h2 className="font-semibold text-lg">
                  {land.name}
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  {land.location}
                </p>

                <div className="text-sm text-gray-700 space-y-1 mb-4">
                  <p>📐 Area: {land.areaSqm} sqm</p>
                  <p>🌱 Trees: ~{land.approxTrees}</p>
                  <p>💧 Water: {land.water}</p>
                  <p>🌦 Climate: {land.weather}</p>
                </div>

                <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
                  I want to plant here
                </button>
              </div>
            </motion.div>
          ))}

          {filteredLands.length === 0 && (
            <p className="text-gray-600">
              No plantation sites found for this search.
            </p>
          )}
        </div>
      </div>

      {/* MAP POPUP */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white w-full max-w-3xl h-[70vh] rounded-xl p-4 flex flex-col"
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">
                  Click on map to select search location
                </h3>
                <button onClick={() => setMapOpen(false)}>
                  Close
                </button>
              </div>

              <div className="flex-1 rounded overflow-hidden">
                <MapContainer
                  center={[19.0, 73.0]}
                  zoom={6}
                  style={{ height: "100%", width: "100%" }}
                  whenCreated={(map) => {
                    map.on("click", (e) => {
                      setPinLocation({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                      });
                      setMapOpen(false);
                    });
                  }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {pinLocation && (
                    <Marker position={pinLocation} />
                  )}
                </MapContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Browse;
