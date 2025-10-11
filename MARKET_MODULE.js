// MODULE 5: MARKET CONDITIONS SCORE CALCULATION
// Input: Property data object (with all previous scores calculated)
// Output: market_score (0-100) and market_reasons array

try {
  // Initialize variables
  let marketScore = 0;
  let marketReasons = [];
  
  // 1. NEIGHBORHOOD VALUE TREND SCORING (0-40 points max)
  let valueTrendScore = 0;
  if ($json.neighborhood_value_trend !== undefined && $json.neighborhood_value_trend !== null) {
    const trend = $json.neighborhood_value_trend.toLowerCase();
    
    if (trend === "increasing") {
      valueTrendScore = 40; // Strong market, good for investment
      marketReasons.push(`Neighborhood value trend increasing: +40 points`);
    } else if (trend === "stable") {
      valueTrendScore = 20;
      marketReasons.push(`Neighborhood value trend stable: +20 points`);
    } else if (trend === "decreasing") {
      valueTrendScore = 5;
      marketReasons.push(`Neighborhood value trend decreasing: +5 points`);
    } else {
      valueTrendScore = 15; // Default for unknown trend
      marketReasons.push(`Unknown neighborhood trend: +15 points`);
    }
  } else {
    valueTrendScore = 15; // Default for missing data
    marketReasons.push(`Unknown neighborhood trend: +15 points (default)`);
  }
  
  // 2. LOCAL BUSINESS GROWTH (0-30 points max)
  // This would typically come from a Google Places API call or similar.
  // For now, we'll use a placeholder based on neighborhood type.
  let businessGrowthScore = 0;
  if ($json.neighborhood_type !== undefined && $json.neighborhood_type !== null) {
    const neighborhoodType = $json.neighborhood_type.toLowerCase();
    if (neighborhoodType === "urban" || neighborhoodType === "suburban") {
      businessGrowthScore = 30; // Urban/suburban areas often have more business activity
      marketReasons.push(`Neighborhood type (${neighborhoodType}) indicates potential for business growth: +30 points`);
    } else if (neighborhoodType === "rural") {
      businessGrowthScore = 10;
      marketReasons.push(`Neighborhood type (${neighborhoodType}) indicates less business growth: +10 points`);
    } else {
      businessGrowthScore = 20; // Default for other types
      marketReasons.push(`Neighborhood type (${neighborhoodType}) indicates moderate business growth: +20 points`);
    }
  } else {
    businessGrowthScore = 15; // Default if no neighborhood type
    marketReasons.push(`Unknown neighborhood type: +15 points (default)`);
  }
  
  // 3. PERMIT ACTIVITY TREND (0-30 points max)
  // This would typically come from a permits API or local government data.
  // For now, we'll use a placeholder based on property age and value.
  let permitActivityScore = 0;
  if ($json.year_built !== undefined && $json.year_built !== null && $json.property_value !== undefined && $json.property_value !== null) {
    const currentYear = new Date().getFullYear();
    const propertyAge = currentYear - parseInt($json.year_built);
    const propertyValue = parseInt($json.property_value);

    // Older properties in high-value areas often see more renovation permits
    if (propertyAge >= 20 && propertyValue >= 500000) {
      permitActivityScore = 30;
      marketReasons.push(`High permit activity expected (older, high-value property): +30 points`);
    } else if (propertyAge >= 10 && propertyValue >= 300000) {
      permitActivityScore = 20;
      marketReasons.push(`Moderate permit activity expected: +20 points`);
    } else if (propertyAge >= 5 && propertyValue >= 200000) {
      permitActivityScore = 15;
      marketReasons.push(`Some permit activity expected: +15 points`);
    } else {
      permitActivityScore = 10;
      marketReasons.push(`Lower permit activity expected: +10 points`);
    }
  } else {
    permitActivityScore = 15; // Default if data is missing
    marketReasons.push(`Unknown permit activity: +15 points (default)`);
  }
  
  // 4. CALCULATE FINAL MARKET SCORE
  const rawScore = valueTrendScore + businessGrowthScore + permitActivityScore;
  
  // Normalize to 0-100 scale (100 max becomes 100)
  marketScore = Math.min(rawScore, 100);
  
  // Ensure minimum score of 0
  marketScore = Math.max(marketScore, 0);
  
  // Add summary to reasons
  marketReasons.push(`Raw Score: ${rawScore}/100 → Final: ${marketScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including all previous module scores)
      market_score: marketScore,
      market_reasons: marketReasons,
      market_breakdown: {
        value_trend_score: valueTrendScore,
        business_growth_score: businessGrowthScore,
        permit_activity_score: permitActivityScore,
        raw_score: rawScore,
        final_score: marketScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Market Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      market_score: 20, // Safe default score
      market_reasons: [
        "Error in market calculation: +20 points (default)",
        "Check data quality and try again"
      ],
      market_breakdown: {
        value_trend_score: 10,
        business_growth_score: 5,
        permit_activity_score: 5,
        raw_score: 20,
        final_score: 20
      },
      error: error.message
    }
  }];
}
