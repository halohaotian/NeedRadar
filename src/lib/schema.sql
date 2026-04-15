-- NeedRadar Database Schema (Neon Postgres)
-- Run this in Neon SQL Editor after creating the database

-- ============================
-- 1. Auth (NextAuth v5)
-- ============================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================
-- 2. Waitlist
-- ============================
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100) DEFAULT 'landing_page',
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-assign position on insert
CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position FROM waitlist;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_waitlist_position
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  WHEN (NEW.position IS NULL)
  EXECUTE FUNCTION assign_waitlist_position();

-- ============================
-- 3. Analytics
-- ============================
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  path VARCHAR(500) NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip VARCHAR(45),
  country VARCHAR(2),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS click_events (
  id SERIAL PRIMARY KEY,
  element_id VARCHAR(255),
  element_type VARCHAR(50), -- 'cta', 'nav', 'pricing', etc.
  page VARCHAR(255),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- Indexes
-- ============================
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_click_events_created_at ON click_events(created_at);
CREATE INDEX IF NOT EXISTS idx_click_events_type ON click_events(element_type);
