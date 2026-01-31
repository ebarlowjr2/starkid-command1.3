-- Migration: Create social_posts table for COMET social drafting pipeline
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to source event
  event_id UUID REFERENCES mission_events(id) ON DELETE SET NULL,
  
  -- Post content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  hashtags TEXT[],  -- Array of hashtags
  
  -- Platform targeting
  platform TEXT NOT NULL DEFAULT 'all',  -- twitter, instagram, facebook, all
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'DRAFT',  -- DRAFT, SCHEDULED, APPROVED, POSTED, REJECTED
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,  -- When to post (T-7d, T-24h, T-1h windows)
  reminder_type TEXT,  -- 'T-7d', 'T-24h', 'T-1h', 'event_day'
  
  -- Approval tracking
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  
  -- Post tracking
  posted_at TIMESTAMPTZ,
  post_url TEXT,  -- URL to the actual post once published
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for) WHERE status IN ('SCHEDULED', 'APPROVED');
CREATE INDEX IF NOT EXISTS idx_social_posts_event ON social_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);

-- Enable Row Level Security
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for approved/posted items
CREATE POLICY "Allow public read for approved posts" ON social_posts
  FOR SELECT USING (status IN ('APPROVED', 'POSTED'));

-- Policy: Allow service role full access (for API routes)
CREATE POLICY "Allow service role full access" ON social_posts
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at (reuses function from mission_events migration)
DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_posts;
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
