// SINGLE GOOGLE SHEETS OUTPUT MODULE - HOT LEAD FINDER
// Sends all leads to one comprehensive Google Sheet with full data visibility
// No service classification - universal spending likelihood only

try {
  // Prepare comprehensive lead data for Google Sheets
  const leadData = {
    // BASIC PROPERTY INFO
    timestamp: new Date().toISOString(),
    property_id: $json.property_id || 'unknown',
    address: $json.address || 'unknown',
    city: $json.city || 'unknown',
    state: $json.state || 'unknown',
    zip_code: $json.zip_code || 'unknown',
    
    // PROPERTY DETAILS
    property_value: $json.property_value || 0,
    purchase_price: $json.purchase_price || 0,
    market_value: $json.market_value || 0,
    year_built: $json.year_built || 0,
    building_sqft: $json.building_sqft || 0,
    lot_size_sqft: $json.lot_size_sqft || 0,
    bedrooms: $json.bedrooms || 0,
    bathrooms: $json.bathrooms || 0,
    property_type: $json.property_type || 'unknown',
    
    // OWNERSHIP INFO
    days_since_purchase: $json.days_since_purchase || 0,
    mortgage_amount: $json.mortgage_amount || 0,
    property_tax_trend: $json.property_tax_trend || 'unknown',
    
    // DEMOGRAPHIC DATA
    estimated_income: $json.estimated_income || 0,
    family_size: $json.family_size || 0,
    school_rating: $json.school_rating || 0,
    neighborhood_type: $json.neighborhood_type || 'unknown',
    neighborhood_value_trend: $json.neighborhood_value_trend || 'unknown',
    neighborhood_median_income: $json.neighborhood_median_income || 0,
    
    // MARKET DATA
    competitor_count: $json.competitor_count || 0,
    population_density: $json.population_density || 0,
    market_growth_rate: $json.market_growth_rate || 0,
    unemployment_rate: $json.unemployment_rate || 0,
    income_trend: $json.income_trend || 'unknown',
    market_maturity: $json.market_maturity || 'unknown',
    
    // FINAL SCORING RESULTS
    final_score: $json.final_score || 0,
    tier: $json.tier || 'UNKNOWN',
    tier_description: $json.tier_description || 'unknown',
    
    // INDIVIDUAL MODULE SCORES
    urgency_score: $json.urgency_score || 0,
    property_score: $json.property_score || 0,
    financial_score: $json.financial_score || 0,
    demographic_score: $json.demographic_score || 0,
    market_score: $json.market_score || 0,
    
    // MODULE BREAKDOWN
    urgency_contribution: $json.final_breakdown?.urgency_contribution || 0,
    property_contribution: $json.final_breakdown?.property_contribution || 0,
    financial_contribution: $json.final_breakdown?.financial_contribution || 0,
    demographic_contribution: $json.final_breakdown?.demographic_contribution || 0,
    market_contribution: $json.final_breakdown?.market_contribution || 0,
    
    // DETAILED REASONS (Truncated for readability)
    urgency_reasons_summary: $json.urgency_reasons ? $json.urgency_reasons.slice(0, 3).join('; ') : 'No urgency data',
    property_reasons_summary: $json.property_reasons ? $json.property_reasons.slice(0, 3).join('; ') : 'No property data',
    financial_reasons_summary: $json.financial_reasons ? $json.financial_reasons.slice(0, 3).join('; ') : 'No financial data',
    demographic_reasons_summary: $json.demographic_reasons ? $json.demographic_reasons.slice(0, 3).join('; ') : 'No demographic data',
    market_reasons_summary: $json.market_reasons ? $json.market_reasons.slice(0, 3).join('; ') : 'No market data',
    
    // CUSTOMER TRACKING FIELDS (To be filled by sales team)
    customer_wants: $json.customer_wants ? $json.customer_wants.join(', ') : '',
    actual_spending: $json.actual_spending || '',
    conversion_date: $json.conversion_date || '',
    project_value: $json.project_value || '',
    services_purchased: $json.services_purchased ? $json.services_purchased.join(', ') : '',
    
    // SYSTEM 3 LEARNING FIELDS (To be calculated by System 3)
    prediction_accuracy: $json.prediction_accuracy || '',
    weight_optimization: $json.weight_optimization || '',
    model_improvement: $json.model_improvement || '',
    
    // DATA QUALITY INDICATORS
    urgency_data_complete: $json.learning_data?.data_quality?.urgency_data_complete || false,
    property_data_complete: $json.learning_data?.data_quality?.property_data_complete || false,
    financial_data_complete: $json.learning_data?.data_quality?.financial_data_complete || false,
    demographic_data_complete: $json.learning_data?.data_quality?.demographic_data_complete || false,
    market_data_complete: $json.learning_data?.data_quality?.market_data_complete || false,
    
    // SPECIAL FEATURES
    has_pool: $json.has_pool || false,
    has_deck: $json.has_deck || false,
    has_basement: $json.has_basement || false,
    has_hoa: $json.has_hoa || false,
    num_garages: $json.num_garages || 0,
    
    // PERMIT/VIOLATION DATA
    days_since_permit: $json.days_since_permit || 0,
    days_since_violation: $json.days_since_violation || 0,
    
    // FINAL REASONS (Truncated for readability)
    final_reasons_summary: $json.final_reasons ? $json.final_reasons.slice(0, 5).join('; ') : 'No final scoring data'
  };
  
  // Return data formatted for Google Sheets
  return [{
    json: {
      // All the data for Google Sheets
      ...leadData,
      
      // Preserve original data for any downstream processing
      original_data: $json,
      
      // Google Sheets specific formatting
      sheets_ready: true,
      export_timestamp: new Date().toISOString(),
      export_version: '1.0',
      system_name: 'HOT_LEAD_FINDER'
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Single Google Sheets Output:', error);
  
  return [{
    json: {
      // Basic error data
      timestamp: new Date().toISOString(),
      property_id: $json.property_id || 'error',
      address: $json.address || 'error',
      final_score: 0,
      tier: 'ERROR',
      tier_description: 'Error in data processing',
      error_message: error.message,
      sheets_ready: false,
      export_timestamp: new Date().toISOString(),
      export_version: '1.0',
      system_name: 'HOT_LEAD_FINDER'
    }
  }];
}
