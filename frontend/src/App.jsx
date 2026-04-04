/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Main React application routes and session bootstrap.
*/
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLandDetail from "./components/AdminLandDetail";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Main from "./components/Main";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import SiteDetail from "./components/SiteDetail";
import ReviewsPage from "./components/Reviewspage";
import About from "./components/About";
import Contact from "./components/Contact";
import PlantationShowcase from "./components/PlantationShowcase";
import AdminPendingLands from "./components/AdminPendingLands";

import "./App.css";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH USER FROM COOKIE SESSION
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

  // ⏳ Prevent early render
  if (loading) {
    return <LoadingSpinner text="Loading...">

    </LoadingSpinner>
  }

  return (
    <Router>

      {/* 🔥 PASS USER */}
      <Navbar user={user} />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* LAND */}
        <Route path="/lands/:id" element={<SiteDetail />} />
        <Route path="/lands/:id/reviews" element={<ReviewsPage />} />

        {/* PROTECTED */}
        <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/plantationShowcase" element={<ProtectedRoute><PlantationShowcase /></ProtectedRoute>} />

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

      </Routes>
    </Router>
  );
}

export default App;