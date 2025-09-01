import React from "react";
import { motion } from 'framer-motion';
import { GiLeafSwirl, GiEarthAmerica, GiTreeBranch, GiPlantSeed, GiFlowerPot, GiButterfly, GiPalmTree } from 'react-icons/gi';

const Landing = () => {
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
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center relative overflow-hidden p-8 text-center">
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
      <motion.div
        className="z-10 max-w-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-green-800 mb-4">
          Welcome to TerraSpotter
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          Join our green community to map and plant trees for a sustainable future. Connect landowners with volunteers, use AI to optimize plantations, and track progress together.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          TerraSpotter empowers schools, NGOs, and individuals to create a collaborative movement for afforestation, starting in Maharashtra and growing globally.
        </p>
        <motion.button
          className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Learn More
        </motion.button>
      </motion.div>
    </main>
  );
};

export default Landing;