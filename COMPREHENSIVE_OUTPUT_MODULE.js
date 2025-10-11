// COMPREHENSIVE OUTPUT MODULE - Outputs ALL data including intermediate scoring
// This works with "Run Once for All Items" mode

// Helper function to format reasons and prevent errors
function formatReason(reason) {
  try {
    if (!reason || reason === null || reason === undefined) {
      return 'No data available';
    }
    
    // Handle different data types safely
    if (typeof reason === 'string') {
      // Clean up any problematic characters that might cause Google Sheets errors
      return reason.replace(/[^\x20-\x7E\s]/g, '').substring(0, 5000); // Limit length and remove non-printable chars
    }
    
    if (Array.isArray(reason)) {
      return reason.map(item => String(item)).join(' | ').substring(0, 5000);
    }
    
    if (typeof reason === 'object') {
      return JSON.stringify(reason).substring(0, 5000);
    }
    
    return String(reason).substring(0, 5000);
  } catch (error) {
    console.log('Error formatting reason:', error.message);
    return 'Data formatting error - see logs';
  }
}

try {
  console.log("=== COMPREHENSIVE OUTPUT MODULE START ===");
  
  // Get all input items
  const allItems = $input.all();
  console.log("Processing", allItems.length, "leads for comprehensive output");
  
  // Add clear instruction for Google Sheets
  const clearInstruction = {
    json: {
      __clear_sheet: true,
      __instruction: "CLEAR_ALL_DATA_AND_START_FRESH"
    }
  };
  
  // Process each item
  const processedItems = allItems.map((item, index) => {
    console.log(`Processing lead ${index + 1}: ${item.json.contact_name}`);
    
    // Extract all the data we want to see in the sheets
    const comprehensiveData = {
      // === BASIC CONTACT INFO ===
      lead_id: item.json.lead_id || '',
      contact_name: item.json.contact_name || '',
      phone: item.json.phone || '',
      email: item.json.email || '',
      address: item.json.address || '',
      city: item.json.city || '',
      state: item.json.state || '',
      zip_code: item.json.zip_code || '',
      
      // === PROPERTY DETAILS ===
      property_value: item.json.property_value || 0,
      purchase_price: item.json.purchase_price || 0,
      market_value: item.json.market_value || 0,
      year_built: item.json.year_built || 0,
      building_sqft: item.json.building_sqft || 0,
      lot_size_sqft: item.json.lot_size_sqft || 0,
      lot_size_acres: item.json.lot_size_acres || 0,
      bedrooms: item.json.bedrooms || 0,
      bathrooms: item.json.bathrooms || 0,
      property_type: item.json.property_type || 'Unknown',
      days_since_purchase: item.json.days_since_purchase || 0,
      mortgage_amount: item.json.mortgage_amount || 0,
      
      // === FINANCIAL INFO ===
      property_tax_trend: item.json.property_tax_trend || 'Unknown',
      estimated_income: item.json.estimated_income || 0,
      family_size: item.json.family_size || 0,
      
      // === NEIGHBORHOOD INFO ===
      school_rating: item.json.school_rating || 0,
      neighborhood_type: item.json.neighborhood_type || 'Unknown',
      neighborhood_value_trend: item.json.neighborhood_value_trend || 'Unknown',
      neighborhood_median_income: item.json.neighborhood_median_income || 0,
      
      // === MARKET DATA ===
      competitor_count: item.json.competitor_count || 0,
      population_density: item.json.population_density || 0,
      market_growth_rate: item.json.market_growth_rate || 0,
      unemployment_rate: item.json.unemployment_rate || 0,
      income_trend: item.json.income_trend || 'Unknown',
      market_maturity: item.json.market_maturity || 'Unknown',
      
      // === AMENITIES ===
      has_pool: item.json.has_pool || false,
      has_deck: item.json.has_deck || false,
      has_basement: item.json.has_basement || false,
      has_hoa: item.json.has_hoa || false,
      num_garages: item.json.num_garages || 0,
      days_since_permit: item.json.days_since_permit || null,
      days_since_violation: item.json.days_since_violation || null,
      business_owner: item.json.business_owner || false,
      
      // === SCORING RESULTS ===
      urgency_score: item.json.urgency_score || 0,
      property_score: item.json.property_score || 0,
      financial_score: item.json.financial_score || 0,
      demographic_score: item.json.demographic_score || 0,
      market_score: item.json.market_score || 0,
      final_score: item.json.final_score || 0,
      
      // === TIER & VALUE ===
      tier: item.json.tier || '',
      lead_value: item.json.lead_value || 0,
      
      // === SCORING BREAKDOWN ===
      urgency_breakdown: JSON.stringify(item.json.urgency_breakdown || {}),
      property_breakdown: JSON.stringify(item.json.property_breakdown || {}),
      financial_breakdown: JSON.stringify(item.json.financial_breakdown || {}),
      demographic_breakdown: JSON.stringify(item.json.demographic_breakdown || {}),
      market_breakdown: JSON.stringify(item.json.market_breakdown || {}),
      scoring_breakdown: JSON.stringify(item.json.scoring_breakdown || {}),
      
      // === REASONS (FIXED) ===
      urgency_reason: formatReason(item.json.urgency_reason || item.json.urgency_reasons || 'No urgency data available'),
      property_reason: formatReason(item.json.property_reason || item.json.property_reasons || 'No property data available'),
      financial_reason: formatReason(item.json.financial_reason || item.json.financial_reasons || 'No financial data available'),
      demographic_reason: formatReason(item.json.demographic_reason || item.json.demographic_reasons || 'No demographic data available'),
      market_reasons: formatReason(item.json.market_reasons || 'No market data available'),
      final_reasons: (() => {
        try {
          const reason = item.json.final_reasons || `Final Score: ${item.json.final_score || 0}/100 - Tier: ${item.json.tier || 'Unknown'}`;
          const formatted = formatReason(reason);
          
          // Create clean, structured summary for ML/data analysis
          const summary = {
            final_score: item.json.final_score || 0,
            tier: item.json.tier || 'Unknown',
            lead_value: item.json.lead_value || 0,
            urgency_weighted: item.json.urgency_score ? Math.round((item.json.urgency_score * 0.25)) : 0,
            property_weighted: item.json.property_score ? Math.round((item.json.property_score * 0.20)) : 0,
            financial_weighted: item.json.financial_score ? Math.round((item.json.financial_score * 0.25)) : 0,
            demographic_weighted: item.json.demographic_score ? Math.round((item.json.demographic_score * 0.20)) : 0,
            market_weighted: item.json.market_score ? Math.round((item.json.market_score * 0.10)) : 0
          };
          
          // Return structured data for ML processing
          return JSON.stringify(summary);
        } catch (error) {
          // Fallback to simple structured data
          return JSON.stringify({
            final_score: item.json.final_score || 0,
            tier: item.json.tier || 'Unknown',
            lead_value: item.json.lead_value || 0,
            error: 'Data formatting issue'
          });
        }
      })(),
      
      // === KEY FACTORS ===
      key_factors: item.json.key_factors ? item.json.key_factors.join(', ') : '',
      
      // === SERVICE INFO ===
      service_type: item.json.service_type || 'landscaping',
      customer_wants: item.json.customer_wants || 'Not specified',
      actual_spending: item.json.actual_spending || 0,
      conversion_date: item.json.conversion_date || 'Not converted',
      project_value: item.json.project_value || 0,
      services_purchased: item.json.services_purchased || 'None',
      prediction_accuracy: item.json.prediction_accuracy || 0,
      weight_optimization: item.json.weight_optimization || 'Standard',
      model_improvement: item.json.model_improvement || 'None',
      
      // === METADATA ===
      processing_timestamp: new Date().toISOString(),
      test_lead_type: item.json.test_lead_type || '',
      
      // === VALIDATION ===
      has_urgency_score: item.json.urgency_score ? 'YES' : 'NO',
      has_property_score: item.json.property_score ? 'YES' : 'NO',
      has_financial_score: item.json.financial_score ? 'YES' : 'NO',
      has_demographic_score: item.json.demographic_score ? 'YES' : 'NO',
      has_market_score: item.json.market_score ? 'YES' : 'NO',
      has_final_score: item.json.final_score ? 'YES' : 'NO',
      
      // === ADDITIONAL COLUMNS ===
      tier_description: item.json.tier_description || 'No tier description',
      calculation_log: JSON.stringify(item.json.calculation_log || []),
      validation_metadata: JSON.stringify(item.json.validation_metadata || {}),
      learning_data: JSON.stringify(item.json.learning_data || {
        lead_pattern: {
          contact_name: item.json.contact_name || 'Unknown',
          property_type: item.json.property_type || 'Unknown',
          tier: item.json.tier || 'Unknown',
          market_maturity: item.json.market_maturity || 'Unknown'
        },
        score_analysis: {
          urgency_score: item.json.urgency_score || 0,
          property_score: item.json.property_score || 0,
          financial_score: item.json.financial_score || 0,
          demographic_score: item.json.demographic_score || 0,
          market_score: item.json.market_score || 0,
          final_score: item.json.final_score || 0
        },
        market_conditions: {
          competition_count: item.json.competitor_count || 0,
          population_density: item.json.population_density || 0,
          market_growth_rate: item.json.market_growth_rate || 0,
          unemployment_rate: item.json.unemployment_rate || 0
        },
        conversion_prediction: {
          potential: item.json.final_score > 80 ? 'HIGH' : item.json.final_score > 60 ? 'MEDIUM' : 'LOW',
          confidence: Math.min(95, Math.max(50, item.json.final_score || 0)),
          lead_value: item.json.lead_value || 0
        },
        processing_metadata: {
          timestamp: new Date().toISOString(),
          data_quality: 'complete',
          validation_status: 'passed'
        }
      }),
      
      // === ZIP CODE (separate column) ===
      zip: item.json.zip_code || item.json.zip || 'Unknown'
    };
    
    console.log(`Lead ${index + 1} comprehensive data prepared with ${Object.keys(comprehensiveData).length} fields`);
    
    return { json: comprehensiveData };
  });
  
  console.log("=== COMPREHENSIVE OUTPUT MODULE END ===");
  console.log("Returning", processedItems.length + 1, "items (including clear instruction)");
  
  // Return clear instruction first, then all processed items
  return [clearInstruction, ...processedItems];
  
} catch (error) {
  console.error('Error in Comprehensive Output Module:', error);
  
  // Return error for all items
  const allItems = $input.all();
  return allItems.map((item, index) => ({
    json: {
      lead_id: item.json.lead_id || `ERROR_${index + 1}`,
      contact_name: item.json.contact_name || 'ERROR',
      error: error.message,
      processing_timestamp: new Date().toISOString()
    }
  }));
}
