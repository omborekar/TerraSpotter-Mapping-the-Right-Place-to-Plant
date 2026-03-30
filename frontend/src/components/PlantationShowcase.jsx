import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Calendar, TreePine, Users, MessageSquare, Camera, X, Check } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function PlantationShowcase() {
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filter, setFilter] = useState("all"); // all, recent, popular

  useEffect(() => {
    fetchPlantations();
  }, []);

  const fetchPlantations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/plantations/completed`, {
        credentials: "include"
      });
      const data = await res.json();
      setPlantations(data);
    } catch (err) {
      console.error("Failed to fetch plantations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlantations = plantations.sort((a, b) => {
    if (filter === "recent") return new Date(b.completedAt) - new Date(a.completedAt);
    if (filter === "popular") return (b.reviews?.length || 0) - (a.reviews?.length || 0);
    return 0;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        
        .ps-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a4d2e 0%, #1a5c3a 50%, #0f3d28 100%);
          padding: 80px 20px 60px;
          position: relative;
          overflow: hidden;
        }
        
        /* Animated background elements */
        .ps-bg-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }
        
        .ps-shape {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%);
          animation: float 20s infinite;
        }
        
        .ps-shape:nth-child(1) { width: 300px; height: 300px; top: -100px; left: -100px; animation-delay: 0s; }
        .ps-shape:nth-child(2) { width: 400px; height: 400px; top: 30%; right: -150px; animation-delay: 5s; }
        .ps-shape:nth-child(3) { width: 250px; height: 250px; bottom: -80px; left: 30%; animation-delay: 10s; }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .ps-content {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        
        /* Header */
        .ps-header {
          text-align: center;
          margin-bottom: 50px;
        }
        
        .ps-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
          letter-spacing: -1px;
        }
        
        .ps-subtitle {
          font-size: 1.125rem;
          color: rgba(255,255,255,0.85);
          max-width: 600px;
          margin: 0 auto 30px;
          line-height: 1.6;
        }
        
        .ps-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }
        
        .ps-stat {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 16px 28px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .ps-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #4ade80;
          display: block;
        }
        
        .ps-stat-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Filter Tabs */
        .ps-filters {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }
        
        .ps-filter-btn {
          padding: 12px 28px;
          border: none;
          border-radius: 50px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          border: 2px solid transparent;
        }
        
        .ps-filter-btn.active {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: #fff;
          box-shadow: 0 8px 20px rgba(74,222,128,0.3);
        }
        
        .ps-filter-btn:hover:not(.active) {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }
        
        /* Grid */
        .ps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 28px;
          margin-bottom: 40px;
        }
        
        /* Card */
        .ps-card {
          background: rgba(255,255,255,0.95);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        
        .ps-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .ps-card-images {
          position: relative;
          aspect-ratio: 16/10;
          overflow: hidden;
          background: #f0f0f0;
        }
        
        .ps-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        
        .ps-card:hover .ps-card-image {
          transform: scale(1.08);
        }
        
        .ps-image-count {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(10px);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8125rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .ps-card-body {
          padding: 24px;
        }
        
        .ps-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .ps-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.375rem;
          font-weight: 600;
          color: #0a4d2e;
          margin-bottom: 6px;
        }
        
        .ps-card-location {
          font-size: 0.875rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .ps-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fef3c7;
          padding: 6px 12px;
          border-radius: 20px;
        }
        
        .ps-rating-value {
          font-weight: 700;
          color: #f59e0b;
          font-size: 0.9375rem;
        }
        
        .ps-card-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .ps-info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: #f0fdf4;
          border-radius: 10px;
        }
        
        .ps-info-item svg {
          color: #16a34a;
          flex-shrink: 0;
        }
        
        .ps-info-label {
          font-size: 0.75rem;
          color: #666;
          display: block;
        }
        
        .ps-info-value {
          font-size: 1rem;
          font-weight: 700;
          color: #0a4d2e;
        }
        
        .ps-card-notes {
          font-size: 0.875rem;
          color: #555;
          line-height: 1.6;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .ps-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        
        .ps-reviews-count {
          font-size: 0.875rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .ps-view-btn {
          padding: 8px 20px;
          background: linear-gradient(135deg, #16a34a, #0a4d2e);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .ps-view-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(22,163,74,0.4);
        }
        
        /* Loading */
        .ps-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }
        
        .ps-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: #4ade80;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Empty State */
        .ps-empty {
          text-align: center;
          padding: 80px 20px;
          color: rgba(255,255,255,0.7);
        }
        
        .ps-empty svg {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          opacity: 0.5;
        }
        
        /* Modal */
        .ps-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }
        
        .ps-modal {
          background: white;
          border-radius: 24px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        
        .ps-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0,0,0,0.1);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 10;
        }
        
        .ps-modal-close:hover {
          background: rgba(0,0,0,0.2);
        }
        
        .ps-modal-images {
          position: relative;
          aspect-ratio: 16/9;
          background: #000;
        }
        
        .ps-modal-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .ps-modal-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .ps-modal-nav:hover {
          background: rgba(0,0,0,0.7);
        }
        
        .ps-modal-nav.prev { left: 20px; }
        .ps-modal-nav.next { right: 20px; }
        
        .ps-modal-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }
        
        .ps-modal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .ps-modal-dot.active {
          background: white;
          width: 24px;
          border-radius: 4px;
        }
        
        .ps-modal-content {
          padding: 32px;
        }
        
        .ps-modal-header {
          margin-bottom: 28px;
        }
        
        .ps-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #0a4d2e;
          margin-bottom: 12px;
        }
        
        .ps-modal-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 0.9375rem;
          color: #666;
        }
        
        .ps-modal-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .ps-modal-section {
          margin-bottom: 32px;
        }
        
        .ps-modal-section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0a4d2e;
          margin-bottom: 16px;
        }
        
        .ps-modal-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }
        
        .ps-modal-stat {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        
        .ps-modal-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #16a34a;
          display: block;
        }
        
        .ps-modal-stat-label {
          font-size: 0.875rem;
          color: #666;
          margin-top: 4px;
        }
        
        .ps-modal-notes {
          background: #fafafa;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #16a34a;
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #333;
        }
        
        .ps-review-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #16a34a, #0a4d2e);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
        }
        
        .ps-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(22,163,74,0.3);
        }
        
        /* Reviews Section */
        .ps-reviews {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 2px solid #e5e7eb;
        }
        
        .ps-review-item {
          background: #fafafa;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        
        .ps-review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .ps-review-user {
          font-weight: 600;
          color: #0a4d2e;
        }
        
        .ps-review-date {
          font-size: 0.8125rem;
          color: #999;
        }
        
        .ps-review-rating {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }
        
        .ps-review-text {
          color: #555;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        
        .ps-review-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
        }
        
        .ps-review-image {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }
        
        .ps-review-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        @media (max-width: 768px) {
          .ps-title { font-size: 2rem; }
          .ps-grid { grid-template-columns: 1fr; }
          .ps-modal-content { padding: 20px; }
          .ps-filters { flex-direction: column; }
        }
      `}</style>

      <div className="ps-container">
        <div className="ps-bg-shapes">
          <div className="ps-shape"></div>
          <div className="ps-shape"></div>
          <div className="ps-shape"></div>
        </div>

        <div className="ps-content">
          {/* Header */}
          <motion.div
            className="ps-header"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="ps-title">🌳 Our Green Legacy</h1>
            <p className="ps-subtitle">
              Witness the transformation. Every plantation tells a story of hope, 
              growth, and commitment to our planet's future.
            </p>
            
            <div className="ps-stats">
              <div className="ps-stat">
                <span className="ps-stat-value">{plantations.length}</span>
                <span className="ps-stat-label">Plantations</span>
              </div>
              <div className="ps-stat">
                <span className="ps-stat-value">
                  {plantations.reduce((sum, p) => sum + (p.treesPlanted || 0), 0).toLocaleString()}
                </span>
                <span className="ps-stat-label">Trees Planted</span>
              </div>
              <div className="ps-stat">
                <span className="ps-stat-value">
                  {plantations.reduce((sum, p) => sum + (p.reviews?.length || 0), 0)}
                </span>
                <span className="ps-stat-label">Reviews</span>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="ps-filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              className={`ps-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Plantations
            </button>
            <button
              className={`ps-filter-btn ${filter === "recent" ? "active" : ""}`}
              onClick={() => setFilter("recent")}
            >
              Most Recent
            </button>
            <button
              className={`ps-filter-btn ${filter === "popular" ? "active" : ""}`}
              onClick={() => setFilter("popular")}
            >
              Most Reviewed
            </button>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="ps-loading">
              <div className="ps-spinner"></div>
            </div>
          ) : filteredPlantations.length === 0 ? (
            <div className="ps-empty">
              <TreePine size={80} />
              <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>No Plantations Yet</h3>
              <p>Be the first to complete a plantation and share it with the community!</p>
            </div>
          ) : (
            <motion.div
              className="ps-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {filteredPlantations.map((plantation, idx) => (
                <PlantationCard
                  key={plantation.id}
                  plantation={plantation}
                  index={idx}
                  onClick={() => setSelectedPlantation(plantation)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPlantation && (
          <PlantationDetailModal
            plantation={selectedPlantation}
            onClose={() => setSelectedPlantation(null)}
            onReview={() => setShowReviewModal(true)}
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <ReviewModal
            plantation={selectedPlantation}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => {
              setShowReviewModal(false);
              fetchPlantations();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Plantation Card Component
function PlantationCard({ plantation, index, onClick }) {
  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((sum, r) => sum + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      className="ps-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
    >
      <div className="ps-card-images">
        <img
          src={plantation.images?.[0] || "https://placehold.co/400x250?text=No+Image"}
          alt={plantation.title}
          className="ps-card-image"
        />
        <div className="ps-image-count">
          <Camera size={14} />
          {plantation.images?.length || 0}
        </div>
      </div>

      <div className="ps-card-body">
        <div className="ps-card-header">
          <div>
            <h3 className="ps-card-title">{plantation.title}</h3>
            <div className="ps-card-location">
              <MapPin size={14} />
              {plantation.location}
            </div>
          </div>
          {avgRating > 0 && (
            <div className="ps-rating">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span className="ps-rating-value">{avgRating}</span>
            </div>
          )}
        </div>

        <div className="ps-card-info">
          <div className="ps-info-item">
            <TreePine size={20} />
            <div>
              <span className="ps-info-label">Trees</span>
              <span className="ps-info-value">{plantation.treesPlanted}</span>
            </div>
          </div>
          <div className="ps-info-item">
            <Calendar size={20} />
            <div>
              <span className="ps-info-label">Completed</span>
              <span className="ps-info-value">
                {new Date(plantation.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {plantation.notes && (
          <p className="ps-card-notes">{plantation.notes}</p>
        )}

        <div className="ps-card-footer">
          <div className="ps-reviews-count">
            <MessageSquare size={16} />
            {plantation.reviews?.length || 0} reviews
          </div>
          <button className="ps-view-btn">View Details</button>
        </div>
      </div>
    </motion.div>
  );
}

// Detail Modal Component
function PlantationDetailModal({ plantation, onClose, onReview }) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = plantation.images || [];

  const avgRating = plantation.reviews?.length
    ? (plantation.reviews.reduce((sum, r) => sum + r.rating, 0) / plantation.reviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      className="ps-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="ps-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button className="ps-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="ps-modal-images">
            <img
              src={images[currentImage]}
              alt={`Plantation ${currentImage + 1}`}
              className="ps-modal-image"
            />
            
            {images.length > 1 && (
              <>
                <button
                  className="ps-modal-nav prev"
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                >
                  ‹
                </button>
                <button
                  className="ps-modal-nav next"
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                >
                  ›
                </button>
                
                <div className="ps-modal-dots">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`ps-modal-dot ${idx === currentImage ? "active" : ""}`}
                      onClick={() => setCurrentImage(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="ps-modal-content">
          {/* Header */}
          <div className="ps-modal-header">
            <h2 className="ps-modal-title">{plantation.title}</h2>
            <div className="ps-modal-meta">
              <div className="ps-modal-meta-item">
                <MapPin size={16} />
                {plantation.location}
              </div>
              <div className="ps-modal-meta-item">
                <Calendar size={16} />
                {new Date(plantation.completedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="ps-modal-meta-item">
                <Users size={16} />
                by {plantation.teamName || "Green Team"}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="ps-modal-section">
            <h3 className="ps-modal-section-title">Plantation Stats</h3>
            <div className="ps-modal-stats">
              <div className="ps-modal-stat">
                <span className="ps-modal-stat-value">{plantation.treesPlanted}</span>
                <span className="ps-modal-stat-label">Trees Planted</span>
              </div>
              <div className="ps-modal-stat">
                <span className="ps-modal-stat-value">{plantation.moreCapacity || 0}</span>
                <span className="ps-modal-stat-label">More Capacity</span>
              </div>
              <div className="ps-modal-stat">
                <span className="ps-modal-stat-value">{avgRating || "—"}</span>
                <span className="ps-modal-stat-label">Avg Rating</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {plantation.notes && (
            <div className="ps-modal-section">
              <h3 className="ps-modal-section-title">Field Notes</h3>
              <div className="ps-modal-notes">{plantation.notes}</div>
            </div>
          )}

          {/* Review Button */}
          <button className="ps-review-btn" onClick={onReview}>
            <Star size={20} />
            Write a Review
          </button>

          {/* Reviews */}
          {plantation.reviews && plantation.reviews.length > 0 && (
            <div className="ps-reviews">
              <h3 className="ps-modal-section-title">
                Community Reviews ({plantation.reviews.length})
              </h3>
              {plantation.reviews.map((review, idx) => (
                <div key={idx} className="ps-review-item">
                  <div className="ps-review-header">
                    <span className="ps-review-user">{review.userName}</span>
                    <span className="ps-review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="ps-review-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < review.rating ? "#f59e0b" : "none"}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                  <p className="ps-review-text">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="ps-review-images">
                      {review.images.map((img, i) => (
                        <div key={i} className="ps-review-image">
                          <img src={img} alt={`Review ${i + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Review Modal Component
function ReviewModal({ plantation, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const addFiles = (files) => {
    const valid = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .slice(0, 5 - photos.length);
    const entries = valid.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...entries].slice(0, 5));
  };

  const removePhoto = (idx) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("rating", rating);
      fd.append("comment", comment);
      photos.forEach(p => fd.append("images", p.file));

      const res = await fetch(`${BASE_URL}/api/plantations/${plantation.id}/review`, {
        method: "POST",
        credentials: "include",
        body: fd
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || `Server error (${res.status})`);
      }

      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="ps-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
      style={{ zIndex: 1001 }}
    >
      <motion.div
        className="ps-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ maxWidth: "600px" }}
      >
        <div style={{ padding: "32px" }}>
          <button className="ps-modal-close" onClick={onClose} disabled={submitting}>
            <X size={20} />
          </button>

          <h2 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: "1.75rem", 
            marginBottom: "24px",
            color: "#0a4d2e"
          }}>
            Write a Review
          </h2>

          {/* Rating */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "600",
              marginBottom: "12px",
              color: "#0a4d2e"
            }}>
              Your Rating *
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={32}
                  fill={star <= rating ? "#f59e0b" : "none"}
                  color="#f59e0b"
                  style={{ cursor: "pointer" }}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "600",
              marginBottom: "12px",
              color: "#0a4d2e"
            }}>
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this plantation... How does it look? Are they maintaining it well?"
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "0.9375rem",
                fontFamily: "inherit",
                resize: "vertical"
              }}
            />
          </div>

          {/* Photos */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "600",
              marginBottom: "12px",
              color: "#0a4d2e"
            }}>
              Add Photos (Optional)
            </label>
            
            {photos.length < 5 && (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f8fafc"
                }}
              >
                <Camera size={32} style={{ margin: "0 auto 12px", color: "#64748b" }} />
                <div style={{ fontSize: "0.875rem", color: "#475569" }}>
                  Click to add photos
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>
            )}

            {photos.length > 0 && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(5, 1fr)", 
                gap: "8px",
                marginTop: "12px"
              }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ 
                    position: "relative", 
                    aspectRatio: "1",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}>
                    <img src={p.previewUrl} alt="" style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover" 
                    }} />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              padding: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "20px"
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "14px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                background: "white",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #16a34a, #0a4d2e)",
                color: "white",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {submitting ? (
                <>
                  <div className="ps-spinner" style={{ 
                    width: "16px", 
                    height: "16px",
                    borderWidth: "2px"
                  }} />
                  Submitting...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}