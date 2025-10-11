// ENHANCED MODULE 4: DEMOGRAPHIC FIT SCORE CALCULATION
// Ultra-detailed scoring focused on spending behavior and neighborhood quality indicators

try {
  // Initialize variables
  let demographicScore = 0;
  let demographicReasons = [];
  
  // 1. ESTIMATED AGE (Peak Spending Demographics) (0-90 points)
  let ageScore = 0;
  let estimatedAge = 35; // Default estimate
  
  // Estimate age based on property characteristics (more sophisticated)
  if ($json.property_value !== undefined && $json.property_value !== null) {
    const propertyValue = parseInt($json.property_value);
    const familySize = $json.family_size || 2;
    const bedrooms = $json.bedrooms || 3;
    const schoolRating = $json.school_rating || 5;
    
    // More sophisticated age estimation
    if (propertyValue >= 600000 && familySize >= 4 && bedrooms >= 4 && schoolRating >= 8) {
      estimatedAge = 45; // Established family with high-value home in good school district
    } else if (propertyValue >= 500000 && familySize >= 3 && bedrooms >= 3) {
      estimatedAge = 42; // Growing family with good income
    } else if (propertyValue >= 400000 && familySize >= 2) {
      estimatedAge = 38; // Young professional couple
    } else if (propertyValue >= 300000) {
      estimatedAge = 35; // Young professional/family
    } else if (propertyValue >= 200000) {
      estimatedAge = 32; // Younger buyer
    } else {
      estimatedAge = 28; // Very young buyer
    }
  }
  
  // Score based on estimated age (peak spending years)
  if (estimatedAge >= 40 && estimatedAge <= 55) {
    ageScore = 90; // Peak earning + spending years - highest score
    demographicReasons.push(`Estimated age ${estimatedAge} (peak earning/spending): +90 points - PEAK SPENDING YEARS`);
  } else if (estimatedAge >= 35 && estimatedAge < 40) {
    ageScore = 75; // High earning years
    demographicReasons.push(`Estimated age ${estimatedAge} (high earning years): +75 points - HIGH SPENDING YEARS`);
  } else if (estimatedAge >= 55 && estimatedAge <= 65) {
    ageScore = 80; // Pre-retirement, peak wealth
    demographicReasons.push(`Estimated age ${estimatedAge} (pre-retirement wealth): +80 points - PEAK WEALTH YEARS`);
  } else if (estimatedAge >= 30 && estimatedAge < 35) {
    ageScore = 60; // Building wealth
    demographicReasons.push(`Estimated age ${estimatedAge} (building wealth): +60 points - BUILDING SPENDING CAPACITY`);
  } else if (estimatedAge >= 65 && estimatedAge <= 75) {
    ageScore = 60; // Retired, fixed income but may have savings
    demographicReasons.push(`Estimated age ${estimatedAge} (retired with savings): +60 points - RETIRED WITH SAVINGS`);
  } else if (estimatedAge > 75) {
    ageScore = 30; // Older, less likely to spend on major projects
    demographicReasons.push(`Estimated age ${estimatedAge} (older demographic): +30 points - LIMITED SPENDING`);
  } else {
    ageScore = 40; // Under 30, limited budget
    demographicReasons.push(`Estimated age ${estimatedAge} (young adult): +40 points - LIMITED BUDGET`);
  }
  
  // 2. FAMILY INDICATORS (Spending Motivation) (0-50 points)
  let familyBonus = 0;
  
  // School district quality (indicates families with kids = more spending)
  if ($json.school_rating !== undefined && $json.school_rating !== null) {
    const schoolRating = parseInt($json.school_rating);
    if (schoolRating >= 9) {
      familyBonus += 25; // Excellent schools = families with kids = more spending
      demographicReasons.push(`Excellent school district (rating ${schoolRating}): +25 points - FAMILIES WITH KIDS = MORE SPENDING`);
    } else if (schoolRating >= 7) {
      familyBonus += 15; // Good schools
      demographicReasons.push(`Good school district (rating ${schoolRating}): +15 points - FAMILIES = MORE SPENDING`);
    } else if (schoolRating >= 5) {
      familyBonus += 5; // Average schools
      demographicReasons.push(`Average school district (rating ${schoolRating}): +5 points - SOME FAMILIES`);
    } else {
      familyBonus += 0; // Poor schools
      demographicReasons.push(`Poor school district (rating ${schoolRating}): +0 points - FEWER FAMILIES`);
    }
  } else {
    demographicReasons.push(`Unknown school rating: +10 points (default)`);
    familyBonus += 10;
  }
  
  // Bedroom count (indicates family size = more spending)
  if ($json.bedrooms !== undefined && $json.bedrooms !== null) {
    const bedrooms = parseInt($json.bedrooms);
    if (bedrooms >= 4) {
      familyBonus += 15; // Large family home = more spending
      demographicReasons.push(`${bedrooms} bedrooms: +15 points - LARGE FAMILY = MORE SPENDING`);
    } else if (bedrooms === 3) {
      familyBonus += 10; // Family home
      demographicReasons.push(`${bedrooms} bedrooms: +10 points - FAMILY HOME = MORE SPENDING`);
    } else {
      familyBonus += 0; // Smaller home
      demographicReasons.push(`${bedrooms} bedrooms: +0 points - SMALLER HOME = LESS SPENDING`);
    }
  } else {
    demographicReasons.push(`Unknown bedroom count: +5 points (default)`);
    familyBonus += 5;
  }
  
  // Family size (more people = more spending)
  if ($json.family_size !== undefined && $json.family_size !== null) {
    const familySize = parseInt($json.family_size);
    if (familySize >= 4) {
      familyBonus += 10; // Large family = more spending
      demographicReasons.push(`Large family (${familySize} people): +10 points - LARGE FAMILY = MORE SPENDING`);
    } else if (familySize === 3) {
      familyBonus += 5; // Growing family
      demographicReasons.push(`Growing family (${familySize} people): +5 points - GROWING FAMILY = MORE SPENDING`);
    } else {
      familyBonus += 0; // Small family or single
      demographicReasons.push(`Small family (${familySize} people): +0 points - SMALL FAMILY = LESS SPENDING`);
    }
  } else {
    demographicReasons.push(`Unknown family size: +5 points (default)`);
    familyBonus += 5;
  }
  
  // Cap family bonus at 50 points
  familyBonus = Math.min(familyBonus, 50);
  
  // 3. NEIGHBORHOOD QUALITY (Pride of Ownership) (0-35 points)
  let neighborhoodBonus = 0;
  
  // Neighborhood median value trend (pride of ownership)
  if ($json.neighborhood_value_trend !== undefined && $json.neighborhood_value_trend !== null) {
    const valueTrend = $json.neighborhood_value_trend.toLowerCase();
    
    if (valueTrend === 'increasing_fast' || valueTrend === 'increasing_10plus') {
      neighborhoodBonus += 20; // Area rapidly improving = pride of ownership
      demographicReasons.push(`Rapidly increasing neighborhood values: +20 points - AREA RAPIDLY IMPROVING = PRIDE OF OWNERSHIP`);
    } else if (valueTrend === 'increasing') {
      neighborhoodBonus += 15; // Area improving = pride of ownership
      demographicReasons.push(`Increasing neighborhood values: +15 points - AREA IMPROVING = PRIDE OF OWNERSHIP`);
    } else if (valueTrend === 'stable') {
      neighborhoodBonus += 10; // Stable area = good maintenance
      demographicReasons.push(`Stable neighborhood values: +10 points - STABLE AREA = GOOD MAINTENANCE`);
    } else if (valueTrend === 'declining') {
      neighborhoodBonus += -10; // Declining area = less pride
      demographicReasons.push(`Declining neighborhood values: -10 points - AREA DECLINING = LESS PRIDE`);
    } else {
      neighborhoodBonus += 5; // Unknown trend
      demographicReasons.push(`Unknown neighborhood trend: +5 points`);
    }
  } else {
    neighborhoodBonus += 10; // Default for unknown trend
    demographicReasons.push(`Unknown neighborhood trend: +10 points (default)`);
  }
  
  // Neighborhood median income (peer pressure to maintain/improve)
  if ($json.neighborhood_median_income !== undefined && $json.neighborhood_median_income !== null) {
    const neighborhoodIncome = parseInt($json.neighborhood_median_income);
    if (neighborhoodIncome >= 150000) {
      neighborhoodBonus += 15; // High-income neighborhood = peer pressure
      demographicReasons.push(`High-income neighborhood ($${neighborhoodIncome.toLocaleString()}): +15 points - PEER PRESSURE TO MAINTAIN/IMPROVE`);
    } else if (neighborhoodIncome >= 100000) {
      neighborhoodBonus += 10;
      demographicReasons.push(`Good-income neighborhood ($${neighborhoodIncome.toLocaleString()}): +10 points - SOME PEER PRESSURE`);
    } else if (neighborhoodIncome >= 75000) {
      neighborhoodBonus += 5;
      demographicReasons.push(`Average-income neighborhood ($${neighborhoodIncome.toLocaleString()}): +5 points - MODERATE PEER PRESSURE`);
    } else {
      neighborhoodBonus += 0;
      demographicReasons.push(`Lower-income neighborhood ($${neighborhoodIncome.toLocaleString()}): +0 points - LESS PEER PRESSURE`);
    }
  } else {
    // Estimate based on property value and school rating
    if ($json.property_value >= 500000 && $json.school_rating >= 8) {
      neighborhoodBonus += 10; // High-value property in good school district = likely high-income neighborhood
      demographicReasons.push(`High-value property in good school district: +10 points - LIKELY HIGH-INCOME NEIGHBORHOOD`);
    } else {
      neighborhoodBonus += 5;
      demographicReasons.push(`Unknown neighborhood income: +5 points (default)`);
    }
  }
  
  // Cap neighborhood bonus at 35 points
  neighborhoodBonus = Math.min(neighborhoodBonus, 35);
  
  // 4. LOCATION TYPE (Spending Behavior) (0-15 points)
  let locationBonus = 0;
  if ($json.neighborhood_type !== undefined && $json.neighborhood_type !== null) {
    const locationType = $json.neighborhood_type.toLowerCase();
    if (locationType === 'suburban') {
      locationBonus = 15; // Most home improvement activity
      demographicReasons.push(`Suburban location: +15 points - MOST HOME IMPROVEMENT ACTIVITY`);
    } else if (locationType === 'urban' || locationType === 'urban_prime') {
      locationBonus = 10; // Urban areas have some improvement activity
      demographicReasons.push(`Urban location: +10 points - SOME HOME IMPROVEMENT ACTIVITY`);
    } else if (locationType === 'rural') {
      locationBonus = 5; // Rural areas have limited improvement activity
      demographicReasons.push(`Rural location: +5 points - LIMITED HOME IMPROVEMENT ACTIVITY`);
    } else {
      locationBonus = 8; // Default for other types
      demographicReasons.push(`${locationType} location: +8 points - MODERATE HOME IMPROVEMENT ACTIVITY`);
    }
  } else {
    locationBonus = 8; // Default for unknown location type
    demographicReasons.push(`Unknown location type: +8 points (default)`);
  }
  
  // 5. CALCULATE FINAL DEMOGRAPHIC SCORE
  const rawScore = ageScore + familyBonus + neighborhoodBonus + locationBonus;
  
  // Normalize to 0-100 scale (190 max becomes 100)
  demographicScore = Math.round((rawScore / 190) * 100);
  
  // Ensure bounds
  demographicScore = Math.min(demographicScore, 100);
  demographicScore = Math.max(demographicScore, 0);
  
  // Add summary to reasons
  demographicReasons.push(`Raw Score: ${rawScore}/190 → Normalized: ${demographicScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including enhanced urgency_score, property_score, and financial_score)
      demographic_score: demographicScore,
      demographic_reasons: demographicReasons,
      demographic_breakdown: {
        estimated_age: estimatedAge,
        age_score: ageScore,
        family_bonus: familyBonus,
        neighborhood_bonus: neighborhoodBonus,
        location_bonus: locationBonus,
        raw_score: rawScore,
        normalized_score: demographicScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Enhanced Demographic Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      demographic_score: 30, // Safe default score
      demographic_reasons: [
        "Error in demographic calculation: +30 points (default)",
        "Check data quality and try again"
      ],
      demographic_breakdown: {
        estimated_age: 35,
        age_score: 20,
        family_bonus: 10,
        neighborhood_bonus: 10,
        location_bonus: 5,
        raw_score: 45,
        normalized_score: 30
      },
      error: error.message
    }
  }];
}
