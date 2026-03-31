import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react"; // ✅ added
import axios from "axios"; // ✅ added

import ProtectedRoute from "./components/ProtectedRoute";

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

const BASE_URL = "http://localhost:8080"; // adjust if needed

function App() {

  // ✅ moved inside component
  const [user, setUser] = useState(null);

  // ✅ fetch session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/session`, {
          withCredentials: true
        });
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };

    fetchSession(); // 🔥 important
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* PUBLIC LAND ROUTES */}
        <Route path="/lands/:id" element={<SiteDetail />} />
        <Route path="/lands/:id/reviews" element={<ReviewsPage />} />

        {/* PROTECTED */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          }
        />

        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Browse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/plantationShowcase"
          element={
            <ProtectedRoute>
              <PlantationShowcase />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute>
              <AdminPendingLands currentUser={user} />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;