-- NeedRadar Database Schema

-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100) DEFAULT 'landing_page',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
