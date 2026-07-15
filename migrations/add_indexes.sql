-- Migration: Add indexes for performance optimization
-- 1. Index for Map Bounding Box Queries
CREATE INDEX IF NOT EXISTS idx_rentals_location_approved ON rentals(approved, latitude, longitude);

-- 2. Index for City/District Filtering
CREATE INDEX IF NOT EXISTS idx_rentals_city_approved ON rentals(approved, city, district);

-- 3. Index for Admin Sorting
CREATE INDEX IF NOT EXISTS idx_rentals_created_at ON rentals(createdAt DESC);
