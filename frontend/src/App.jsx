/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Main React application routes and session bootstrap.
*/
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Browse = lazy(() => import("./pages/Browse"));
const Profile = lazy(() => import("./pages/Profile"));
const SiteDetail = lazy(() => import("./pages/SiteDetail"));
const ReviewsPage = lazy(() => import("./pages/Reviewspage"));
const Forum = lazy(() => import("./pages/Forum"));
const PlantationShowcase = lazy(() => import("./pages/PlantationShowcase"));
const AdminPendingLands = lazy(() => import("./pages/AdminPendingLands"));
const AdminLandDetail = lazy(() => import("./pages/AdminLandDetail"));
const GrowthTracker = lazy(() => import("./pages/GrowthTracker"));
const CommunityFeed = lazy(() => import("./pages/CommunityFeed"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Main = lazy(() => import("./pages/Main"));
const NotFound = lazy(() => import("./pages/NotFound"));

import "./App.css";

const BASE_URL = import.meta.env.VITE_API_URL;

import { useUser } from "./context/UserContext";

function App() {
  const { loading } = useUser();

  // Show spinner while session check is in progress
  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
        <Routes>
          <Route element={<MainLayout />}>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forum" element={<Forum />} />
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
                  <AdminPendingLands />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lands/:id/verify"
              element={
                <ProtectedRoute>
                  <AdminLandDetail />
                </ProtectedRoute>
              }
            />

            {/* CATCH-ALL */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;