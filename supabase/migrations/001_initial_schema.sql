-- =============================================================================
-- AI Spend Audit — Supabase Database Schema
-- Day 5: Backend persistence, lead capture, share URLs
--
-- Run this in your Supabase SQL editor:
-- Dashboard → SQL Editor → New query → Paste → Run
-- =============================================================================

-- ─── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLE: audits
--
-- Design decisions:
-- 1. `share_slug` is the public identifier (12-char nanoid, NOT the UUID).
--    - Non-sequential → impossible to enumerate
--    - Short → clean URLs like /r/abc123xyz456
-- 2. `public_snapshot` stores ONLY anonymized data safe for public display.
--    - No emails, no company names, no team names
--    - This is enforced at the application layer in lib/db/audits.ts
-- 3. Metrics columns (monthly_spend, savings, etc.) are denormalized for
--    fast analytics queries without JSON parsing.
-- 4. `ip_hash` stores a daily-salted SHA-256 hash, NOT the raw IP.
-- =============================================================================
CREATE TABLE IF NOT EXISTS audits (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_slug           TEXT UNIQUE NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Rate limiting (hashed IP, never plaintext)
  ip_hash              TEXT,

  -- Denormalized financial metrics (fast queries, no JSON parsing needed)
  total_monthly_spend  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_annual_spend   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  annual_savings       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  monthly_savings      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  savings_percentage   NUMERIC(5, 2)  NOT NULL DEFAULT 0,
  health_score         SMALLINT       NOT NULL DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  tool_count           SMALLINT       NOT NULL DEFAULT 0,
  team_size            SMALLINT       NOT NULL DEFAULT 1,
  actionable_count     SMALLINT       NOT NULL DEFAULT 0,
  high_confidence_count SMALLINT      NOT NULL DEFAULT 0,

  -- Public-safe JSON snapshot (PII-free by construction)
  public_snapshot      JSONB          NOT NULL DEFAULT '{}',

  -- Lead tracking
  has_lead             BOOLEAN        NOT NULL DEFAULT FALSE,

  -- Viral analytics
  view_count           INTEGER        NOT NULL DEFAULT 0
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS audits_share_slug_idx ON audits (share_slug);
CREATE INDEX IF NOT EXISTS audits_created_at_idx ON audits (created_at DESC);
CREATE INDEX IF NOT EXISTS audits_ip_hash_idx ON audits (ip_hash) WHERE ip_hash IS NOT NULL;

-- =============================================================================
-- TABLE: leads
--
-- Design decisions:
-- 1. Separate table from audits — GDPR right-to-erasure = DELETE this row only.
--    Audit analytics survive independently.
-- 2. `email` is stored as plaintext (needed for sending). Unique per audit_id
--    (one lead capture per email per audit).
-- 3. `email_status` tracks Resend delivery (pending → sent | failed).
-- 4. `source` tracks where the lead was captured (future A/B testing).
-- =============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id            UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  email               TEXT NOT NULL,
  email_status        TEXT NOT NULL DEFAULT 'pending'
                        CHECK (email_status IN ('pending', 'sent', 'failed')),
  resend_message_id   TEXT,

  source              TEXT NOT NULL DEFAULT 'share-modal',
  ip_hash             TEXT,

  -- Prevent duplicate captures for same email + audit
  UNIQUE (audit_id, email)
);

CREATE INDEX IF NOT EXISTS leads_audit_id_idx ON leads (audit_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- =============================================================================
-- FUNCTION: increment_view_count
--
-- Called via Supabase RPC to atomically increment the view counter.
-- Using a function instead of a direct UPDATE keeps the logic server-side
-- and allows us to call it with a single RPC from the app layer.
-- =============================================================================
CREATE OR REPLACE FUNCTION increment_view_count(slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE audits
  SET view_count = view_count + 1
  WHERE share_slug = slug;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- The app uses the service role key (bypasses RLS) for all writes.
-- The anon key (used by the browser) has NO direct table access.
-- This means all DB reads/writes go through our API routes — no client-side
-- Supabase calls that could be manipulated.
-- =============================================================================
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- No public read/write policies — all access is via service role in API routes.
-- If you want to add direct browser queries later, add policies here.
