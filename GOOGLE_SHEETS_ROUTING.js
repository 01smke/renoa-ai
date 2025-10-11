// GOOGLE SHEETS ROUTING SYSTEM
// This creates the final workflow structure for routing leads to Google Sheets

// STEP 1: Add Filter Node (IF Node)
// Condition: {{ $json.tier !== 'Filtered' }}
// This filters out leads below 35 points

// STEP 2: Add Switch Node
// Mode: Rules
// Rules based on: {{ $json.primary_service }}
// Routes: landscaping, roofing, remodeling, flooring, hvac, windows

// STEP 3: Add Google Sheets Nodes (one for each service)
// Each node will append a row with this data structure:

const leadData = {
  // Basic Info
  "Lead ID": `LEAD-${$json.property_id || $json.address.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}`,
  "Date Generated": new Date().toISOString().split('T')[0],
  "Address": $json.address,
  "City": $json.city,
  "State": $json.state,
  "Zip": $json.zip,
  
  // Property Details
  "Property Value": $json.property_value,
  "Property Age": new Date().getFullYear() - ($json.year_built || new Date().getFullYear()),
  "Lot Size": $json.lot_size_acres,
  "Building Sqft": $json.building_sqft,
  "Bedrooms": $json.bedrooms,
  "Property Type": $json.property_type,
  
  // Contact Info (if available)
  "Contact Name": $json.contact_name || "",
  "Phone": $json.phone || "",
  "Email": $json.email || "",
  
  // Service Classification
  "Primary Service": $json.primary_service,
  "All Services": $json.all_services ? $json.all_services.join(", ") : $json.primary_service,
  
  // Scoring Results
  "Final Score": $json.final_score,
  "Tier": $json.tier,
  "Lead Value": $json.lead_value,
  
  // Individual Module Scores
  "Urgency Score": $json.urgency_score,
  "Property Score": $json.property_score,
  "Financial Score": $json.financial_score,
  "Demographic Score": $json.demographic_score,
  "Market Score": $json.market_score,
  
  // Key Indicators
  "Key Factors": $json.key_factors ? $json.key_factors.join(", ") : "",
  "Days Since Purchase": $json.days_since_purchase,
  "Estimated Income": $json.estimated_income,
  "School Rating": $json.school_rating,
  "Neighborhood Type": $json.neighborhood_type,
  "Has Pool": $json.has_pool,
  "Has HOA": $json.has_hoa,
  "Business Owner": $json.business_owner,
  "Family Size": $json.family_size,
  
  // Timing Data
  "Days Since Permit": $json.days_since_permit,
  "Days Since Violation": $json.days_since_violation,
  "Property Tax Trend": $json.property_tax_trend,
  "Neighborhood Value Trend": $json.neighborhood_value_trend
};

// This data structure will be sent to the appropriate Google Sheet
// based on the primary_service value

return [{ json: leadData }];

