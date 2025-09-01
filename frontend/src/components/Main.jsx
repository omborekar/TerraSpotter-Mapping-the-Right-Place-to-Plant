import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from 'framer-motion';
import { GiLeafSwirl, GiEarthAmerica, GiTreeBranch, GiPlantSeed, GiFlowerPot, GiButterfly, GiPalmTree } from 'react-icons/gi';
import { FaMapMarkerAlt } from 'react-icons/fa';

const Main = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placeForm, setPlaceForm] = useState({
    location: '',
    area: '',
    description: '',
    images: [],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/auth/session", {
          withCredentials: true, // send cookies
        });
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handlePlaceFormChange = (e) => {
    const { name, value } = e.target;
    setPlaceForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setPlaceForm((prev) => ({ ...prev, images: files }));
      setFormErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  const validatePlaceForm = () => {
    const errors = {};
    if (!placeForm.location) errors.location = 'Location is required';
    if (!placeForm.area) errors.area = 'Area is required';
    else if (isNaN(placeForm.area) || placeForm.area <= 0) errors.area = 'Area must be a positive number';
    if (!placeForm.description) errors.description = 'Description is required';
    if (placeForm.images.length < 3) errors.images = 'At least three images are required';
    return errors;
  };

  const handlePlaceFormSubmit = (e) => {
    e.preventDefault();
    const errors = validatePlaceForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      // Simulate API call to submit place data
      console.log('Place submitted:', placeForm);
      alert('Thank you! Your place has been reported for planting.');
      setPlaceForm({ location: '', area: '', description: '', images: [] });
    }
  };

  const floatingVariants = {
    leafSwirl: { rotate: [0, 360], transition: { duration: 10, repeat: Infinity, ease: 'linear' } },
    earth: { rotate: [0, 360], transition: { duration: 20, repeat: Infinity, ease: 'linear' } },
    treeBranch: { y: [0, -10, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    plantSeed: { scale: [1, 1.2, 1], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
    flowerPot: { rotate: [-5, 5, -5], y: [0, -5, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
    butterfly: { x: [-10, 10, -10], y: [10, -10, 10], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
    palmTree: { y: [0, -5, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center relative overflow-hidden p-8">
      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 left-10 text-green-500 opacity-30 text-6xl"
        variants={floatingVariants.leafSwirl}
        animate="leafSwirl"
      >
        <GiLeafSwirl />
      </motion.div>
      <motion.div
        className="absolute top-20 right-20 text-green-600 opacity-20 text-8xl"
        variants={floatingVariants.earth}
        animate="earth"
      >
        <GiEarthAmerica />
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-20 text-green-700 opacity-40 text-7xl"
        variants={floatingVariants.treeBranch}
        animate="treeBranch"
      >
        <GiTreeBranch />
      </motion.div>
      <motion.div
        className="absolute top-40 left-40 text-green-400 opacity-30 text-5xl"
        variants={floatingVariants.plantSeed}
        animate="plantSeed"
      >
        <GiPlantSeed />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-green-500 opacity-25 text-6xl"
        variants={floatingVariants.flowerPot}
        animate="flowerPot"
      >
        <GiFlowerPot />
      </motion.div>
      <motion.div
        className="absolute top-60 right-40 text-green-600 opacity-35 text-5xl"
        variants={floatingVariants.butterfly}
        animate="butterfly"
      >
        <GiButterfly />
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-green-700 opacity-20 text-9xl"
        variants={floatingVariants.palmTree}
        animate="palmTree"
      >
        <GiPalmTree />
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl z-10">
        {/* Left: Welcome Section */}
        <motion.div
          className="bg-white/90 p-8 rounded-xl shadow-lg max-w-md w-full text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {loading ? (
            <p className="text-xl text-gray-700">Loading...</p>
          ) : user ? (
            <>
              <h1 className="text-4xl font-bold text-green-800 mb-4">
                Welcome, {user.name || 'Green Champion'}!
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                You're part of the TerraSpotter community, working to map and plant trees for a sustainable future.
              </p>
              <p className="text-md text-gray-600 mb-8">
                Use our AI-powered platform to register land, connect with volunteers, and track afforestation progress.
              </p>
              <motion.button
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Planting
              </motion.button>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-green-800 mb-4">
                Welcome to TerraSpotter
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Join our green community to map and plant trees for a sustainable future.
              </p>
              <p className="text-md text-gray-600 mb-8">
                Please log in to access your personalized dashboard and start contributing.
              </p>
              <motion.button
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log In
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Right: Report Place Card */}
        <motion.div
          className="bg-white/90 p-8 rounded-xl shadow-lg max-w-md w-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-green-700 mb-4">Report a Place to Plant</h2>
          <form onSubmit={handlePlaceFormSubmit}>
            <div className="mb-4">
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-green-500" />
                <input
                  type="text"
                  name="location"
                  placeholder="Location (select on map)"
                  value={placeForm.location}
                  onChange={handlePlaceFormChange}
                  className="w-full p-2 pl-10 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
            </div>
            <div className="mb-4">
              <input
                type="number"
                name="area"
                placeholder="Area (in sq. meters)"
                value={placeForm.area}
                onChange={handlePlaceFormChange}
                className="w-full p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {formErrors.area && <p className="text-red-500 text-sm mt-1">{formErrors.area}</p>}
            </div>
            <div className="mb-4">
              <textarea
                name="description"
                placeholder="Description of the land"
                value={placeForm.description}
                onChange={handlePlaceFormChange}
                className="w-full p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
              />
              {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Upload Images (at least 3)</label>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {formErrors.images && <p className="text-red-500 text-sm mt-1">{formErrors.images}</p>}
              {placeForm.images.length > 0 && (
                <p className="text-gray-600 text-sm mt-1">{placeForm.images.length} image(s) selected</p>
              )}
            </div>
            <motion.button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Place
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  );
};

export default Main;