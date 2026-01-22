import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { motion } from "framer-motion";

/* ================= DUMMY SITE DATA ================= */
const site = {
  id: 1,
  name: "Open Ground near Village A",
  location: "Nashik, Maharashtra",

  images: [
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  ],

  coordinates: {
    lat: 19.9975,
    lng: 73.7898,
  },

  areaSqm: 5200,
  approxTrees: 260,

  landStatus: "Vacant",
  verificationStatus: "Verified",

  waterAvailability: "Yes",
  waterFrequency: "Weekly",

  climate: {
    type: "Semi-arid",
    avgTemp: "24°C",
    rainfall: "850 mm/year",
  },

  recommendedPlants: ["Neem", "Peepal", "Banyan"],
};

/* ================= COMPONENT ================= */
const SiteDetail = () => {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-1">
            {site.name}
          </h1>
          <p className="text-gray-600">{site.location}</p>
        </motion.div>

        {/* IMAGE GALLERY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {site.images.map((img, i) => (
            <motion.img
              key={i}
              src={img}
              alt="land"
              className="rounded-xl object-cover h-56 w-full"
              whileHover={{ scale: 1.03 }}
            />
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT – DETAILS */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 space-y-6">

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Area" value={`${site.areaSqm} sqm`} />
              <Stat label="Trees possible" value={`~${site.approxTrees}`} />
              <Stat label="Water" value={site.waterAvailability} />
              <Stat label="Status" value={site.landStatus} />
            </div>

            {/* CLIMATE */}
            <Section title="Climate & Environment">
              <p>Climate: {site.climate.type}</p>
              <p>Avg Temperature: {site.climate.avgTemp}</p>
              <p>Rainfall: {site.climate.rainfall}</p>
            </Section>

            {/* RECOMMENDATIONS */}
            <Section title="Recommended Tree Species">
              <div className="flex flex-wrap gap-2">
                {site.recommendedPlants.map((p, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Section>
          </div>

          {/* RIGHT – MAP + ACTION */}
          <div className="bg-white rounded-xl shadow p-6 space-y-6">

            <div className="h-60 rounded overflow-hidden">
              <MapContainer
                center={[site.coordinates.lat, site.coordinates.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[site.coordinates.lat, site.coordinates.lng]} />
              </MapContainer>
            </div>

            <div className="text-sm text-gray-700">
              <p>
                Verification:
                <span className="ml-2 text-green-700 font-medium">
                  {site.verificationStatus}
                </span>
              </p>
            </div>

            <button className="w-full bg-green-700 text-white py-3 rounded hover:bg-green-800">
              I want to plant here
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ================= SMALL COMPONENTS ================= */
const Stat = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <div className="text-sm text-gray-700 space-y-1">
      {children}
    </div>
  </div>
);

export default SiteDetail;
