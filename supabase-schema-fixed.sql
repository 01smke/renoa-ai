-- Lead Scraper CRM Database Schema - Supabase Compatible
-- Run this in your Supabase SQL editor

-- Enable UUID extension (Supabase has this by default, but just in case)
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
  tier TEXT,
  urgency_score INTEGER,
  property_score INTEGER,
  financial_score INTEGER,
  demographic_score INTEGER,
  market_score INTEGER,
  
  -- Lead Management
  status TEXT DEFAULT 'new',
  priority TEXT,
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
  status TEXT,
  
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
  event_type TEXT,
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

CREATE INDEX idx_scraper_runs_status ON scraper_runs(status);
CREATE INDEX idx_scraper_runs_started_at ON scraper_runs(started_at);

CREATE INDEX idx_conversion_events_lead_id ON conversion_events(lead_id);
CREATE INDEX idx_conversion_events_event_type ON conversion_events(event_type);

CREATE INDEX idx_scoring_performance_lead_id ON scoring_performance(lead_id);

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

-- Sample data for testing
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
