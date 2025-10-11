-- Lead Scraper CRM Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contact Info
  name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  
  -- Property Data
  property_value INTEGER,
  property_age INTEGER,
  square_feet INTEGER,
  lot_size_acres DECIMAL,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  
  -- Purchase Info
  purchase_date DATE,
  days_since_purchase INTEGER,
  purchase_price INTEGER,
  
  -- Scoring Data
  final_score INTEGER,
  tier TEXT CHECK (tier IN ('Tier 1', 'Tier 2', 'Tier 3')),
  urgency_score INTEGER,
  property_score INTEGER,
  financial_score INTEGER,
  demographic_score INTEGER,
  market_score INTEGER,
  
  -- Lead Management
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'qualified', 'connected', 'closed', 'dead')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  source TEXT DEFAULT 'rentcast',
  
  -- Conversion Tracking
  contacted_at TIMESTAMP WITH TIME ZONE,
  interested BOOLEAN DEFAULT false,
  services_needed TEXT[],
  project_value INTEGER,
  closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes & Assignment
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Flags
  is_duplicate BOOLEAN DEFAULT false,
  data_quality_score INTEGER
);

-- Scraper runs table
CREATE TABLE scraper_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')),
  
  -- Results
  properties_processed INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  tier_1_count INTEGER DEFAULT 0,
  tier_2_count INTEGER DEFAULT 0,
  tier_3_count INTEGER DEFAULT 0,
  filtered_count INTEGER DEFAULT 0,
  
  -- Performance
  duration_seconds INTEGER,
  errors TEXT[],
  
  -- Config
  source TEXT,
  config JSONB
);

-- Conversion events table
CREATE TABLE conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  event_type TEXT CHECK (event_type IN ('contacted', 'responded', 'qualified', 'closed')),
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

-- Scoring performance table
CREATE TABLE scoring_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prediction
  lead_id UUID REFERENCES leads(id),
  predicted_tier TEXT,
  predicted_score INTEGER,
  
  -- Actual Outcome
  actual_conversion BOOLEAN,
  actual_project_value INTEGER,
  
  -- Analysis
  prediction_accuracy BOOLEAN,
  score_differential INTEGER
);

-- Indexes for performance
CREATE INDEX idx_leads_tier ON leads(tier);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_final_score ON leads(final_score);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

CREATE INDEX idx_scraper_runs_status ON scraper_runs(status);
CREATE INDEX idx_scraper_runs_started_at ON scraper_runs(started_at);

CREATE INDEX idx_conversion_events_lead_id ON conversion_events(lead_id);
CREATE INDEX idx_conversion_events_event_type ON conversion_events(event_type);

CREATE INDEX idx_scoring_performance_lead_id ON scoring_performance(lead_id);

-- Row Level Security (RLS) Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Users see assigned leads" ON leads FOR SELECT
USING (auth.uid() = assigned_to OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins full access to leads" ON leads FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for scraper_runs
CREATE POLICY "All users can view scraper runs" ON scraper_runs FOR SELECT
USING (true);

CREATE POLICY "Admins can manage scraper runs" ON scraper_runs FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for conversion_events
CREATE POLICY "Users see events for their leads" ON conversion_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = conversion_events.lead_id 
    AND (leads.assigned_to = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  )
);

-- RLS Policies for scoring_performance
CREATE POLICY "Users see performance for their leads" ON scoring_performance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = scoring_performance.lead_id 
    AND (leads.assigned_to = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  )
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
INSERT INTO leads (
  name, phone, email, address, city, state, zip,
  property_value, property_age, square_feet, lot_size_acres, property_type, bedrooms, bathrooms,
  purchase_date, days_since_purchase, purchase_price,
  final_score, tier, urgency_score, property_score, financial_score, demographic_score, market_score,
  status, priority, source
) VALUES 
(
  'John Smith', '555-0123', 'john@email.com', '123 Oak St', 'Chicago', 'IL', '60614',
  750000, 5, 3500, 0.3, 'Single Family', 4, 3,
  '2024-11-01', 45, 720000,
  84, 'Tier 1', 100, 100, 34, 100, 100,
  'new', 'high', 'rentcast'
),
(
  'Sarah Johnson', '555-0124', 'sarah@email.com', '456 Pine Ave', 'Chicago', 'IL', '60615',
  520000, 18, 2800, 0.4, 'Single Family', 3, 2,
  '2024-09-15', 90, 500000,
  67, 'Tier 2', 75, 80, 45, 70, 60,
  'contacted', 'medium', 'rentcast'
),
(
  'Mike Davis', '555-0125', 'mike@email.com', '789 Elm St', 'Chicago', 'IL', '60616',
  420000, 25, 2200, 0.25, 'Townhouse', 2, 2,
  '2024-08-01', 120, 400000,
  52, 'Tier 3', 60, 65, 35, 55, 45,
  'new', 'low', 'rentcast'
);
