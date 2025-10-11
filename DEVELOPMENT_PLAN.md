# Multi-Service Lead Generation Tool - Development Plan

## 🚀 Project Overview

Build a clean, free-tier N8N workflow that generates qualified leads for 6 home services: **Landscaping, Roofing, Remodeling, Flooring, HVAC, and Windows/Doors**. The system scores properties across 5 modules and routes leads to service-specific Google Sheets.

---

## ✅ Core Objectives

- **Multi-Service Focus**: 6 home service types (not just landscaping)
- **Free-Tier Only**: No premium data sources or expensive APIs
- **Quality Scoring**: 5-module scoring system with service-specific weights
- **Clean Architecture**: Simple linear workflow (no complex branching)
- **High Volume**: 1,000–3,000 qualified leads/day capacity
- **Quality Driven**: Target 25%+ conversion rate for Tier 1 leads

---

## 🎯 The 3-System Architecture

### SYSTEM 1 (What we're building in N8N)
- Finds properties from free APIs
- Scores each property across 5 modules
- Determines which service(s) they need
- Assigns tier (1, 2, or 3)
- Outputs to Google Sheets

### SYSTEM 2 (Partner's tool - not our concern)
- Calls the leads to verify interest
- Matches to service providers
- Tracks conversions

### SYSTEM 3 (Future optimization - not building yet)
- Analyzes conversion data
- Recommends scoring improvements
- Creates learning loop

---

## ⭐ Lead Scoring Tiers

### Tier 1 (70+ points - 25-40% conversion)
- New homeowners (<6 months) with urgent needs
- High-value properties with seasonal timing
- Recent permits or violations requiring action

### Tier 2 (50-69 points - 15-25% conversion)
- Established homeowners with aging properties
- Mid-value properties with moderate needs
- Seasonal timing for appropriate services

### Tier 3 (35-49 points - 5-15% conversion)
- Older properties with potential needs
- Lower-value properties with basic requirements
- Off-season or less urgent timing

### Filtered Out (<35 points)
- Properties with no clear service needs
- Very low-value properties
- Poor timing or demographic fit

---

## 📊 The 5-Module Scoring System

### MODULE 1: URGENCY/TIMING (0-100 points)
- **New Homeowner Status**: Days since purchase (90 days = 100 points)
- **Seasonal Timing**: Service-specific seasonal bonuses
- **Recent Permits**: Days since permit (30 days = 90 points)
- **Code Violations**: Days since violation (60 days = 85 points)

### MODULE 2: PROPERTY CHARACTERISTICS (0-100 points)
- **Property Age**: 15-25 years = 90 points (peak maintenance age)
- **Property Value**: $600k+ = 100 points
- **Property Size**: 3000+ sqft = 90 points
- **Lot Size**: 0.5+ acres = 85 points (for exterior services)
- **Property Type**: Single family = 80 points
- **HOA Status**: HOA properties = +20 bonus

### MODULE 3: FINANCIAL CAPACITY (0-100 points) - FREE VERSION
- **Property Value**: Primary indicator of spending capacity
- **Estimated Income**: Census data by ZIP code
- **Property Tax Trend**: Increasing taxes = +20 bonus
- **NO luxury vehicle data** (expensive, poor ROI)
- **NO mortgage-to-value** (not worth it for free version)

### MODULE 4: DEMOGRAPHIC FIT (0-100 points)
- **Age Range**: 40-60 years = 85 points (peak spending age)
- **Family Indicators**: School district, bedroom count, suburban location
- **Neighborhood Pride**: Property value trends in area

### MODULE 5: MARKET CONDITIONS (0-100 points)
- **Competitor Density**: Google Places API (free tier)
- **Competitor Quality**: Review ratings analysis
- **Market Opportunity**: Fewer/better competitors = higher score

---

## 🏠 Service Types & Classification

### 1. Landscaping
- **Indicators**: Large lots (0.25+ acres), pools, HOA properties
- **Seasonal Peak**: Spring (March-May)
- **Weights**: Urgency 30%, Property 25%, Financial 25%, Demo 15%, Market 5%

### 2. Roofing
- **Indicators**: Age 15+ years, recent storms, roof permits
- **Seasonal Peak**: Warm months (April-September)
- **Weights**: Urgency 40%, Property 30%, Financial 20%, Demo 5%, Market 5%

### 3. Remodeling
- **Indicators**: New homeowners (180 days), high value ($400k+)
- **Seasonal Peak**: Year-round (slight winter dip)
- **Weights**: Urgency 25%, Property 20%, Financial 35%, Demo 15%, Market 5%

### 4. Flooring
- **Indicators**: Age 15+ years, recent purchases
- **Seasonal Peak**: Year-round (slight spring peak)
- **Weights**: Urgency 30%, Property 25%, Financial 25%, Demo 15%, Market 5%

### 5. HVAC
- **Indicators**: Age 15+ years, seasonal timing
- **Seasonal Peak**: Summer/Winter (June-Aug, Dec-Feb)
- **Weights**: Urgency 45%, Property 25%, Financial 20%, Demo 5%, Market 5%

### 6. Windows/Doors
- **Indicators**: Age 20+ years, energy efficiency needs
- **Seasonal Peak**: Fall (Sept-Nov) for winter prep
- **Weights**: Urgency 35%, Property 30%, Financial 25%, Demo 5%, Market 5%

---

## 📂 Data Sources (FREE VERSION ONLY)

### Required APIs
- **RentCast**: Property data, sale dates, values (~$50-200/month)
- **Census API**: Median income by ZIP code (FREE)
- **Google Places API**: Competitor data (FREE tier: 2,500 requests/day)

### Optional (if budget allows)
- **BatchData**: Contact enrichment ($0.025 per lookup)
- **Building Permits**: Urgency signals (varies by city, $0-300/month)

### NO Premium Sources
- ❌ Satellite imagery
- ❌ Luxury vehicle data
- ❌ Social media signals
- ❌ Mortgage data
- ❌ Credit scores

---

## 💡 N8N Workflow Architecture (Clean Linear Flow)

### NODE 1: Daily Trigger
- **Type**: Schedule Trigger (Cron)
- **Schedule**: Daily at 8:00 AM
- **Name**: "Daily Lead Generation"

### NODE 2: Fetch Properties
- **Type**: HTTP Request
- **Method**: GET
- **URL**: RentCast API endpoint
- **Name**: "Fetch Properties (RentCast)"

### NODE 3: Process in Batches
- **Type**: Split In Batches
- **Batch Size**: 10
- **Name**: "Process Properties in Batches"

### NODES 4-8: Scoring Modules
- **NODE 4**: Calculate Urgency Score (Function)
- **NODE 5**: Calculate Property Score (Function)
- **NODE 6**: Calculate Financial Score (Function)
- **NODE 7**: Calculate Demographic Score (Function)
- **NODE 8**: Calculate Market Score (Function)

### NODE 9: Service Classification
- **Type**: Function
- **Name**: "Determine Service Type"
- **Logic**: Analyze property characteristics to determine which services are needed

### NODE 10: Final Scoring
- **Type**: Function
- **Name**: "Calculate Final Score & Tier"
- **Logic**: Apply service-specific weights and assign tiers

### NODE 11: Filter Quality
- **Type**: IF Node
- **Condition**: `{{ $json.tier !== 'Filtered' }}`
- **Name**: "Keep Only Qualified Leads"

### NODE 12: Route by Service
- **Type**: Switch
- **Mode**: Rules
- **Rules**: Based on `{{ $json.primaryService }}`
- **Name**: "Route to Service Sheets"

### NODES 13-18: Google Sheets Output
- **Landscaping Leads** (Google Sheets)
- **Roofing Leads** (Google Sheets)
- **Remodeling Leads** (Google Sheets)
- **Flooring Leads** (Google Sheets)
- **HVAC Leads** (Google Sheets)
- **Windows Leads** (Google Sheets)

---

## 📊 Google Sheets Output Structure

Each service sheet contains:
```
A: Lead ID
B: Date Generated
C: Address
D: City
E: State
F: Zip
G: Property Value
H: Property Age
I: Lot Size
J: Contact Name (if available)
K: Phone (if available)
L: Email (if available)
M: Primary Service
N: All Services
O: Final Score
P: Tier
Q: Urgency Score
R: Property Score
S: Financial Score
T: Demographic Score
U: Market Score
V: Key Factors (why this lead is good)
W: Days Since Purchase
X: Estimated Income
```

---

## ⚖️ Technical Requirements

### API Rate & Cost Management
- Exponential backoff for API calls
- Batch processing (10 properties at a time)
- Free tier limits respected
- Error handling for rate limits

### Data Quality
- Address cleanup and validation
- Freshness filters (ignore stale data)
- Deduplication logic
- Graceful handling of missing data

### Scaling
- Linear workflow (no complex branching)
- Memory-efficient processing
- Retry logic for failed API calls
- Comprehensive error logging

---

## 📈 Success Metrics

- **Lead Volume**: 1,000-3,000 qualified leads/day
- **Quality Distribution**: 20% Tier 1, 30% Tier 2, 50% Tier 3
- **Service Distribution**: Balanced across all 6 services
- **Cost Efficiency**: <$0.50 per qualified lead
- **Data Quality**: >95% complete records

---

## ✅ Development Timeline

- **Week 1**: Core workflow structure + Timing Module
- **Week 2**: Property + Financial Modules
- **Week 3**: Demographic + Market Modules
- **Week 4**: Service Classification + Final Scoring
- **Week 5**: Google Sheets integration + Testing
- **Week 6**: Error handling + Production optimization

---

## 🚀 Production Features

### Error Handling
- Graceful degradation for missing data
- Comprehensive logging
- No workflow crashes
- Safe default values

### Monitoring
- Lead volume tracking
- API usage monitoring
- Error rate tracking
- Performance metrics

### Scalability
- Linear processing flow
- Efficient memory usage
- Batch processing
- Rate limit compliance

Ready to build a clean, efficient, multi-service lead generation system! 🚀
