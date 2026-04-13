/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Main React application routes and session bootstrap.
*/
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import axios from "axios";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const Browse = lazy(() => import("./components/Browse"));
const Profile = lazy(() => import("./components/Profile"));
const SiteDetail = lazy(() => import("./components/SiteDetail"));
const ReviewsPage = lazy(() => import("./components/Reviewspage"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const PlantationShowcase = lazy(() => import("./components/PlantationShowcase"));
const AdminPendingLands = lazy(() => import("./components/AdminPendingLands"));
const AdminLandDetail = lazy(() => import("./components/AdminLandDetail"));
const GrowthTracker = lazy(() => import("./components/GrowthTracker"));
const CommunityFeed = lazy(() => import("./components/CommunityFeed"));
const Leaderboard = lazy(() => import("./components/Leaderboard"));
const Main = lazy(() => import("./components/Main"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));


import "./App.css";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch authenticated user from cookie session on app load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/session`, {
          withCredentials: true
        });

        setUser(res.data);

      } catch (err) {
        console.error("Session error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Show spinner while session check is in progress
  if (loading) {
    return <LoadingSpinner text="Loading..."></LoadingSpinner>;
  }

  return (
    <Router>
      <ScrollToTop />

      {/* 🔥 PASS USER */}
      <Navbar user={user} />

      <Suspense fallback={<LoadingSpinner text="Fetching layout..." />}>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* LAND */}
          <Route path="/lands/:id" element={<SiteDetail />} />
          <Route path="/lands/:id/reviews" element={<ReviewsPage />} />
          <Route path="/lands/:id/growth" element={<GrowthTracker />} />

          {/* PROTECTED */}
          <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/plantationShowcase" element={<ProtectedRoute><PlantationShowcase /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} />

          {/* ADMIN */}
          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute>
                <AdminPendingLands currentUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lands/:id/verify"
            element={
              <ProtectedRoute>
                <AdminLandDetail currentUser={user} />
              </ProtectedRoute>
            }
          />

          {/* CATCH-ALL */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;