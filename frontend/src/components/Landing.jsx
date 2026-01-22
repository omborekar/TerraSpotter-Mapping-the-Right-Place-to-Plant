import React from "react";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4">
              Sustainable Infrastructure Platform
            </p>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              TerraSpotter
            </h1>

            <p className="text-xl text-gray-700 mb-6 max-w-xl">
              A data-driven platform that connects land, people, and
              intelligence to enable scalable, transparent afforestation.
            </p>

            <p className="text-gray-600 mb-10 max-w-xl">
              We help institutions, NGOs, and communities identify plantation-ready
              land, recommend suitable tree species, and track impact using maps,
              AI models, and verified contributions.
            </p>

            <div className="flex gap-4">
              <button className="px-7 py-3 rounded-md bg-green-700 text-white font-medium hover:bg-green-800 transition">
                Get Started
              </button>

              <button className="px-7 py-3 rounded-md border border-gray-300 font-medium text-gray-800 hover:bg-gray-50 transition">
                View Platform
              </button>
            </div>
          </motion.div>

          {/* Right Visual Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-green-100 to-green-200 border shadow-sm flex items-center justify-center">
              <p className="text-green-800 font-semibold">
                Interactive Map + AI Insights
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Verified Land Discovery
            </h3>
            <p className="text-gray-600">
              Identify and validate plantation-ready land using geo-tagged
              submissions and community review.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              AI-based Recommendations
            </h3>
            <p className="text-gray-600">
              Suggest optimal tree species and plantation density based on
              soil, climate, and location data.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Transparent Impact Tracking
            </h3>
            <p className="text-gray-600">
              Track plantations over time with maps, data logs, and community
              verification.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
};

export default Landing;
