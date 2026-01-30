-- Migration: Create mission_events table for sky events and other mission data
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS mission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  title TEXT NOT NULL,
  event_hash TEXT UNIQUE NOT NULL,  -- SHA256 hash for deduplication
  
  -- Categorization
  category TEXT NOT NULL DEFAULT 'mission',  -- mission, launch, sky_event
  subtype TEXT,  -- moon_phase, conjunction, meteor_shower, eclipse, etc.
  
  -- Timing
  event_time_utc TIMESTAMPTZ NOT NULL,
  end_time_utc TIMESTAMPTZ,  -- For events with duration (meteor showers, etc.)
  
  -- Content
  description TEXT,
  visibility TEXT,  -- Viewing conditions/location info
  
  -- Source tracking
  source TEXT,  -- e.g., "USNO Astronomical Applications"
  source_url TEXT,
  
  -- Metadata (flexible JSON for additional data)
  metadata JSONB DEFAULT '{}',
  
  -- Social integration
  social_draft_eligible BOOLEAN DEFAULT false,  -- Whether this event should trigger social drafts
  social_draft_created BOOLEAN DEFAULT false,   -- Whether a draft has been created
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mission_events_category ON mission_events(category);
CREATE INDEX IF NOT EXISTS idx_mission_events_subtype ON mission_events(subtype);
CREATE INDEX IF NOT EXISTS idx_mission_events_event_time ON mission_events(event_time_utc);
CREATE INDEX IF NOT EXISTS idx_mission_events_hash ON mission_events(event_hash);
CREATE INDEX IF NOT EXISTS idx_mission_events_social_eligible ON mission_events(social_draft_eligible) WHERE social_draft_eligible = true;

-- Enable Row Level Security
ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access" ON mission_events
  FOR SELECT USING (true);

-- Policy: Allow service role full access (for API routes)
CREATE POLICY "Allow service role full access" ON mission_events
  FOR ALL USING (auth.role() = 'service_role');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_mission_events_updated_at ON mission_events;
CREATE TRIGGER update_mission_events_updated_at
  BEFORE UPDATE ON mission_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
