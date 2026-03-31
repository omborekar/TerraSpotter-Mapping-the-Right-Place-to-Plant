import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

import "./App.css";

function App() {
  return (
    <Router>
      <ProtectedRoute>
        <Navbar />
      </ProtectedRoute>
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
      </Routes>
    </Router>
  );
}

export default App;
