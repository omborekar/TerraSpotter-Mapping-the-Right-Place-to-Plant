-- V1__init.sql
-- Initial schema for TerraSpotter platform
-- PostgreSQL dialect

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  fname VARCHAR(255),
  lname VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone_no VARCHAR(50),
  dob DATE,
  role VARCHAR(50),
  password VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email);

-- LAND
CREATE TABLE IF NOT EXISTS land_details (
  id BIGSERIAL PRIMARY KEY,
  verified BOOLEAN DEFAULT FALSE,
  district VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  polygon_coords JSONB,
  centroid_lat DOUBLE PRECISION,
  centroid_lng DOUBLE PRECISION,
  area_sqm DOUBLE PRECISION,
  owner_name VARCHAR(255),
  owner_phone VARCHAR(50),
  ownership_type VARCHAR(255),
  permission_status VARCHAR(255),
  land_status VARCHAR(255),
  water_available VARCHAR(100),
  water_frequency VARCHAR(100),
  fencing BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_road VARCHAR(255),
  soil_type VARCHAR(255),
  nearby_landmark VARCHAR(255),
  plantation_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL
);
-- GIN index to speed JSONB queries on polygon data
CREATE INDEX IF NOT EXISTS idx_land_polygon_coords_gin ON land_details USING GIN (polygon_coords);
-- simple spatial index on centroid
CREATE INDEX IF NOT EXISTS idx_land_centroid ON land_details (centroid_lat, centroid_lng);

-- PLANTATION STARTS
CREATE TABLE IF NOT EXISTS plantation_starts (
  id BIGSERIAL PRIMARY KEY,
  land_id BIGINT NOT NULL REFERENCES land_details(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  planned_date DATE,
  team_size INTEGER,
  trees_to_plant INTEGER,
  method VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plantation_start_land_created_at ON plantation_starts (land_id, created_at DESC);

-- PLANTATION COMPLETIONS
CREATE TABLE IF NOT EXISTS plantation_completions (
  id BIGSERIAL PRIMARY KEY,
  land_id BIGINT REFERENCES land_details(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  trees_planted INTEGER,
  more_capacity INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plantation_completion_land_created_at ON plantation_completions (land_id, created_at DESC);

-- COMPLETION IMAGES (proof photos)
CREATE TABLE IF NOT EXISTS plantation_completion_images (
  id BIGSERIAL PRIMARY KEY,
  completion_id BIGINT NOT NULL REFERENCES plantation_completions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PLANTATION REVIEWS
CREATE TABLE IF NOT EXISTS plantation_reviews (
  id BIGSERIAL PRIMARY KEY,
  completion_id BIGINT NOT NULL REFERENCES plantation_completions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plantation_review_images (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES plantation_reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LAND REVIEWS (one review per user per land enforced)
CREATE TABLE IF NOT EXISTS land_reviews (
  id BIGSERIAL PRIMARY KEY,
  land_id BIGINT NOT NULL REFERENCES land_details(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER,
  feasibility_note VARCHAR(255),
  permission_note VARCHAR(255),
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT uq_land_user_review UNIQUE (land_id, user_id)
);

-- LAND VERIFICATIONS (unique per user + land)
CREATE TABLE IF NOT EXISTS land_verifications (
  id BIGSERIAL PRIMARY KEY,
  land_id BIGINT NOT NULL REFERENCES land_details(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote VARCHAR(16) NOT NULL CHECK (vote IN ('APPROVE','REJECT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT uq_land_user_verification UNIQUE (land_id, user_id)
);

-- LAND IMAGES
CREATE TABLE IF NOT EXISTS land_images (
  id BIGSERIAL PRIMARY KEY,
  land_id BIGINT NOT NULL REFERENCES land_details(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LAND RECOMMENDATIONS (ML output)
CREATE TABLE IF NOT EXISTS land_recommendations (
  id BIGSERIAL PRIMARY KEY,
  land_id BIGINT NOT NULL REFERENCES land_details(id) ON DELETE CASCADE,
  plant_name VARCHAR(255) NOT NULL,
  suitability_score DOUBLE PRECISION,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_phone_no ON users(phone_no);
CREATE INDEX IF NOT EXISTS idx_land_created_by ON land_details(created_by);
CREATE INDEX IF NOT EXISTS idx_completion_user ON plantation_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_start_user ON plantation_starts(user_id);

-- Final note: adapt constraints if your environment requires soft-deletes or different cascade rules.
