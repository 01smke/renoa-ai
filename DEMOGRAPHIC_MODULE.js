// MODULE 4: DEMOGRAPHIC FIT SCORE CALCULATION
// Input: Property data object (with urgency_score, property_score, and financial_score already calculated)
// Output: demographic_score (0-100) and demographic_reasons array

try {
  // Initialize variables
  let demographicScore = 0;
  let demographicReasons = [];
  
  // 1. AGE DEMOGRAPHICS SCORING (0-40 points max)
  // Estimate age from property characteristics (since we don't have actual owner age)
  let ageScore = 0;
  let estimatedAge = 35; // Default estimate
  
  // Estimate age based on property characteristics
  if ($json.property_value !== undefined && $json.property_value !== null) {
    const propertyValue = parseInt($json.property_value);
    const familySize = $json.family_size || 2;
    const bedrooms = $json.bedrooms || 3;
    
    // Higher value + more bedrooms + larger family = likely older, established family
    if (propertyValue >= 600000 && familySize >= 4 && bedrooms >= 4) {
      estimatedAge = 45; // Established family with high-value home
    } else if (propertyValue >= 450000 && familySize >= 3) {
      estimatedAge = 40; // Growing family with good income
    } else if (propertyValue >= 300000) {
      estimatedAge = 35; // Young professional/family
    } else {
      estimatedAge = 30; // Younger buyer
    }
  }
  
  // Score based on estimated age
  if (estimatedAge >= 40 && estimatedAge <= 60) {
    ageScore = 40; // Peak spending age - highest score
    demographicReasons.push(`Estimated age ${estimatedAge} (peak spending age): +40 points`);
  } else if (estimatedAge >= 35 && estimatedAge < 40) {
    ageScore = 30; // High spending age
    demographicReasons.push(`Estimated age ${estimatedAge} (high spending age): +30 points`);
  } else if (estimatedAge >= 60 && estimatedAge <= 70) {
    ageScore = 25; // Empty nesters with money
    demographicReasons.push(`Estimated age ${estimatedAge} (empty nester): +25 points`);
  } else if (estimatedAge >= 30 && estimatedAge < 35) {
    ageScore = 20; // Young professionals
    demographicReasons.push(`Estimated age ${estimatedAge} (young professional): +20 points`);
  } else if (estimatedAge > 70) {
    ageScore = 15; // Older, less likely to spend on major projects
    demographicReasons.push(`Estimated age ${estimatedAge} (older demographic): +15 points`);
  } else {
    ageScore = 10; // Very young, limited budget
    demographicReasons.push(`Estimated age ${estimatedAge} (very young): +10 points`);
  }
  
  // 2. FAMILY INDICATORS SCORING (0-35 points max)
  let familyBonus = 0;
  
  // School district rating bonus
  if ($json.school_rating !== undefined && $json.school_rating !== null) {
    const schoolRating = parseInt($json.school_rating);
    if (schoolRating >= 8) {
      familyBonus += 15; // Excellent schools = families with kids
      demographicReasons.push(`Excellent school district (rating ${schoolRating}): +15 points`);
    } else if (schoolRating >= 6) {
      familyBonus += 10; // Good schools
      demographicReasons.push(`Good school district (rating ${schoolRating}): +10 points`);
    } else {
      familyBonus += 5; // Average schools
      demographicReasons.push(`Average school district (rating ${schoolRating}): +5 points`);
    }
  } else {
    demographicReasons.push("Unknown school rating: +5 points (default)");
    familyBonus += 5;
  }
  
  // Bedroom count bonus
  if ($json.bedrooms !== undefined && $json.bedrooms !== null) {
    const bedrooms = parseInt($json.bedrooms);
    if (bedrooms >= 4) {
      familyBonus += 10; // Large family home
      demographicReasons.push(`${bedrooms} bedrooms (large family): +10 points`);
    } else if (bedrooms >= 3) {
      familyBonus += 5; // Family home
      demographicReasons.push(`${bedrooms} bedrooms (family home): +5 points`);
    } else {
      familyBonus += 0; // Smaller home
      demographicReasons.push(`${bedrooms} bedrooms (smaller home): +0 points`);
    }
  } else {
    demographicReasons.push("Unknown bedroom count: +5 points (default)");
    familyBonus += 5;
  }
  
  // Suburban location bonus
  if ($json.neighborhood_type !== undefined && $json.neighborhood_type !== null) {
    const neighborhoodType = $json.neighborhood_type.toLowerCase();
    if (neighborhoodType === 'suburban') {
      familyBonus += 10; // Suburban = families
      demographicReasons.push(`Suburban location (family area): +10 points`);
    } else if (neighborhoodType === 'urban') {
      familyBonus += 5; // Urban = mixed
      demographicReasons.push(`Urban location: +5 points`);
    } else {
      familyBonus += 3; // Other
      demographicReasons.push(`${neighborhoodType} location: +3 points`);
    }
  } else {
    demographicReasons.push("Unknown neighborhood type: +5 points (default)");
    familyBonus += 5;
  }
  
  // Cap family bonus at 35 points
  familyBonus = Math.min(familyBonus, 35);
  
  // 3. NEIGHBORHOOD PRIDE SCORING (0-25 points max)
  let prideScore = 0;
  if ($json.neighborhood_value_trend !== undefined && $json.neighborhood_value_trend !== null) {
    const valueTrend = $json.neighborhood_value_trend.toLowerCase();
    
    if (valueTrend === 'increasing') {
      prideScore = 25; // Area is improving, residents take pride
      demographicReasons.push(`Increasing neighborhood values (area pride): +25 points`);
    } else if (valueTrend === 'stable') {
      prideScore = 15; // Stable area, good maintenance
      demographicReasons.push(`Stable neighborhood values: +15 points`);
    } else {
      prideScore = 5; // Declining area
      demographicReasons.push(`Declining neighborhood values: +5 points`);
    }
  } else {
    prideScore = 10; // Default for unknown trend
    demographicReasons.push("Unknown neighborhood trend: +10 points (default)");
  }
  
  // 4. CALCULATE FINAL DEMOGRAPHIC SCORE
  const rawScore = ageScore + familyBonus + prideScore;
  
  // Normalize to 0-100 scale (100 max becomes 100)
  demographicScore = Math.min(rawScore, 100);
  
  // Ensure minimum score of 0
  demographicScore = Math.max(demographicScore, 0);
  
  // Add summary to reasons
  demographicReasons.push(`Raw Score: ${rawScore}/100 → Final: ${demographicScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including previous module scores)
      demographic_score: demographicScore,
      demographic_reasons: demographicReasons,
      demographic_breakdown: {
        estimated_age: estimatedAge,
        age_score: ageScore,
        family_bonus: familyBonus,
        pride_score: prideScore,
        raw_score: rawScore,
        final_score: demographicScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Demographic Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      demographic_score: 20, // Safe default score
      demographic_reasons: [
        "Error in demographic calculation: +20 points (default)",
        "Check data quality and try again"
      ],
      demographic_breakdown: {
        estimated_age: 35,
        age_score: 10,
        family_bonus: 10,
        pride_score: 10,
        raw_score: 30,
        final_score: 20
      },
      error: error.message
    }
  }];
}

