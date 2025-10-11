// MODULE 2: PROPERTY CHARACTERISTICS SCORE CALCULATION
// Input: Property data object (with urgency_score already calculated)
// Output: property_score (0-100) and property_reasons array

try {
  // Initialize variables
  let propertyScore = 0;
  let propertyReasons = [];
  
  // Get current year for age calculations
  const currentYear = new Date().getFullYear();
  
  // 1. PROPERTY AGE SCORING (0-30 points max)
  let ageScore = 0;
  if ($json.year_built !== undefined && $json.year_built !== null) {
    const propertyAge = currentYear - parseInt($json.year_built);
    
    if (propertyAge >= 15 && propertyAge <= 25) {
      ageScore = 30; // Peak maintenance age - highest score
      propertyReasons.push(`Property age ${propertyAge} years (peak maintenance): +30 points`);
    } else if (propertyAge >= 25 && propertyAge <= 40) {
      ageScore = 25; // High maintenance needs
      propertyReasons.push(`Property age ${propertyAge} years (high maintenance): +25 points`);
    } else if (propertyAge > 40) {
      ageScore = 20; // Very old, needs work
      propertyReasons.push(`Property age ${propertyAge} years (very old): +20 points`);
    } else if (propertyAge >= 10 && propertyAge < 15) {
      ageScore = 15; // Moderate age
      propertyReasons.push(`Property age ${propertyAge} years (moderate age): +15 points`);
    } else if (propertyAge >= 5 && propertyAge < 10) {
      ageScore = 10; // Still relatively new
      propertyReasons.push(`Property age ${propertyAge} years (relatively new): +10 points`);
    } else {
      ageScore = 5; // Very new (0-5 years)
      propertyReasons.push(`Property age ${propertyAge} years (very new): +5 points`);
    }
  } else {
    ageScore = 5; // Default for unknown age
    propertyReasons.push("Unknown property age: +5 points (default)");
  }
  
  // 2. PROPERTY VALUE SCORING (0-25 points max)
  let valueScore = 0;
  if ($json.property_value !== undefined && $json.property_value !== null) {
    const propertyValue = parseInt($json.property_value);
    
    if (propertyValue >= 600000) {
      valueScore = 25; // High value - likely to invest in services
      propertyReasons.push(`High value property ($${propertyValue.toLocaleString()}): +25 points`);
    } else if (propertyValue >= 450000) {
      valueScore = 20;
      propertyReasons.push(`Good value property ($${propertyValue.toLocaleString()}): +20 points`);
    } else if (propertyValue >= 300000) {
      valueScore = 15;
      propertyReasons.push(`Moderate value property ($${propertyValue.toLocaleString()}): +15 points`);
    } else if (propertyValue >= 200000) {
      valueScore = 10;
      propertyReasons.push(`Lower value property ($${propertyValue.toLocaleString()}): +10 points`);
    } else {
      valueScore = 5;
      propertyReasons.push(`Low value property ($${propertyValue.toLocaleString()}): +5 points`);
    }
  } else {
    valueScore = 5; // Default for unknown value
    propertyReasons.push("Unknown property value: +5 points (default)");
  }
  
  // 3. PROPERTY SIZE SCORING (0-20 points max)
  let sizeScore = 0;
  if ($json.building_sqft !== undefined && $json.building_sqft !== null) {
    const buildingSqft = parseInt($json.building_sqft);
    
    if (buildingSqft >= 3000) {
      sizeScore = 20; // Large home - more services needed
      propertyReasons.push(`Large home (${buildingSqft.toLocaleString()} sqft): +20 points`);
    } else if (buildingSqft >= 2000) {
      sizeScore = 15;
      propertyReasons.push(`Good sized home (${buildingSqft.toLocaleString()} sqft): +15 points`);
    } else if (buildingSqft >= 1500) {
      sizeScore = 10;
      propertyReasons.push(`Medium sized home (${buildingSqft.toLocaleString()} sqft): +10 points`);
    } else {
      sizeScore = 5;
      propertyReasons.push(`Smaller home (${buildingSqft.toLocaleString()} sqft): +5 points`);
    }
  } else {
    sizeScore = 5; // Default for unknown size
    propertyReasons.push("Unknown property size: +5 points (default)");
  }
  
  // 4. LOT SIZE SCORING (0-15 points max) - Important for exterior services
  let lotScore = 0;
  if ($json.lot_size_acres !== undefined && $json.lot_size_acres !== null) {
    const lotSizeAcres = parseFloat($json.lot_size_acres);
    
    if (lotSizeAcres >= 0.5) {
      lotScore = 15; // Large lot - great for landscaping
      propertyReasons.push(`Large lot (${lotSizeAcres} acres): +15 points`);
    } else if (lotSizeAcres >= 0.25) {
      lotScore = 12;
      propertyReasons.push(`Good sized lot (${lotSizeAcres} acres): +12 points`);
    } else if (lotSizeAcres >= 0.1) {
      lotScore = 8;
      propertyReasons.push(`Medium lot (${lotSizeAcres} acres): +8 points`);
    } else {
      lotScore = 3;
      propertyReasons.push(`Small lot (${lotSizeAcres} acres): +3 points`);
    }
  } else {
    lotScore = 3; // Default for unknown lot size
    propertyReasons.push("Unknown lot size: +3 points (default)");
  }
  
  // 5. PROPERTY TYPE SCORING (0-15 points max)
  let typeScore = 0;
  if ($json.property_type !== undefined && $json.property_type !== null) {
    const propertyType = $json.property_type.toLowerCase();
    
    if (propertyType === 'single family' || propertyType === 'single-family') {
      typeScore = 15; // Best for all services
      propertyReasons.push(`Single family home: +15 points`);
    } else if (propertyType === 'townhouse' || propertyType === 'town house') {
      typeScore = 10; // Good for some services
      propertyReasons.push(`Townhouse: +10 points`);
    } else if (propertyType === 'condo' || propertyType === 'condominium') {
      typeScore = 5; // Limited service needs
      propertyReasons.push(`Condo: +5 points`);
    } else {
      typeScore = 8; // Default for other types
      propertyReasons.push(`Other property type (${$json.property_type}): +8 points`);
    }
  } else {
    typeScore = 8; // Default for unknown type
    propertyReasons.push("Unknown property type: +8 points (default)");
  }
  
  // 6. HOA BONUS (0-10 points max)
  let hoaBonus = 0;
  if ($json.has_hoa !== undefined && $json.has_hoa !== null) {
    const hasHOA = $json.has_hoa === true || $json.has_hoa === 'true' || $json.has_hoa === 1;
    
    if (hasHOA) {
      hoaBonus = 10; // HOA properties often require services
      propertyReasons.push(`HOA property (service requirements): +10 points`);
    } else {
      hoaBonus = 0;
      propertyReasons.push(`No HOA: +0 points`);
    }
  } else {
    hoaBonus = 0; // Default for unknown HOA status
    propertyReasons.push("Unknown HOA status: +0 points (default)");
  }
  
  // 7. CALCULATE FINAL PROPERTY SCORE
  const rawScore = ageScore + valueScore + sizeScore + lotScore + typeScore + hoaBonus;
  
  // Normalize to 0-100 scale (115 max becomes 100)
  propertyScore = Math.round((rawScore / 115) * 100);
  
  // Ensure bounds
  propertyScore = Math.min(propertyScore, 100);
  propertyScore = Math.max(propertyScore, 0);
  
  // Add summary to reasons
  propertyReasons.push(`Raw Score: ${rawScore}/115 → Normalized: ${propertyScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including urgency_score)
      property_score: propertyScore,
      property_reasons: propertyReasons,
      property_breakdown: {
        age_score: ageScore,
        value_score: valueScore,
        size_score: sizeScore,
        lot_score: lotScore,
        type_score: typeScore,
        hoa_bonus: hoaBonus,
        raw_score: rawScore,
        normalized_score: propertyScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Property Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      property_score: 20, // Safe default score
      property_reasons: [
        "Error in property calculation: +20 points (default)",
        "Check data quality and try again"
      ],
      property_breakdown: {
        age_score: 5,
        value_score: 5,
        size_score: 5,
        lot_score: 3,
        type_score: 8,
        hoa_bonus: 0,
        raw_score: 26,
        normalized_score: 20
      },
      error: error.message
    }
  }];
}
