// ENHANCED MODULE 2: PROPERTY CHARACTERISTICS SCORE CALCULATION
// Ultra-detailed scoring focused on renovation need indicators

try {
  // Initialize variables
  let propertyScore = 0;
  let propertyReasons = [];
  
  // Get current year for age calculations
  const currentYear = new Date().getFullYear();
  
  // 1. PROPERTY AGE (Renovation Need Indicator) (0-100 points)
  let ageScore = 0;
  if ($json.year_built !== undefined && $json.year_built !== null) {
    const propertyAge = currentYear - parseInt($json.year_built);
    
    if (propertyAge >= 15 && propertyAge <= 25) {
      ageScore = 100; // Prime renovation age - everything needs updating
      propertyReasons.push(`Property age ${propertyAge} years: +100 points - PRIME RENOVATION AGE (everything needs updating)`);
    } else if (propertyAge >= 25 && propertyAge <= 35) {
      ageScore = 80; // High renovation needs
      propertyReasons.push(`Property age ${propertyAge} years: +80 points - HIGH RENOVATION NEEDS`);
    } else if (propertyAge >= 35 && propertyAge <= 50) {
      ageScore = 70; // Significant renovation needs
      propertyReasons.push(`Property age ${propertyAge} years: +70 points - SIGNIFICANT RENOVATION NEEDS`);
    } else if (propertyAge >= 10 && propertyAge < 15) {
      ageScore = 60; // Moderate renovation needs
      propertyReasons.push(`Property age ${propertyAge} years: +60 points - MODERATE RENOVATION NEEDS`);
    } else if (propertyAge > 50) {
      ageScore = 50; // Either well-maintained or neglected
      propertyReasons.push(`Property age ${propertyAge} years: +50 points - OLD PROPERTY (well-maintained or neglected)`);
    } else {
      ageScore = 20; // Too new for major renovations
      propertyReasons.push(`Property age ${propertyAge} years: +20 points - TOO NEW (minimal renovation needs)`);
    }
  } else {
    ageScore = 30; // Default for unknown age
    propertyReasons.push(`Unknown property age: +30 points (default)`);
  }
  
  // 2. PROPERTY VALUE (Budget Indicator) (0-100 points)
  let valueScore = 0;
  if ($json.property_value !== undefined && $json.property_value !== null) {
    const propertyValue = parseInt($json.property_value);
    
    if (propertyValue >= 800000) {
      valueScore = 100; // Premium budget
      propertyReasons.push(`Premium value ($${propertyValue.toLocaleString()}): +100 points - PREMIUM BUDGET`);
    } else if (propertyValue >= 600000) {
      valueScore = 90;
      propertyReasons.push(`High value ($${propertyValue.toLocaleString()}): +90 points - HIGH BUDGET`);
    } else if (propertyValue >= 500000) {
      valueScore = 80;
      propertyReasons.push(`Good value ($${propertyValue.toLocaleString()}): +80 points - GOOD BUDGET`);
    } else if (propertyValue >= 400000) {
      valueScore = 70;
      propertyReasons.push(`Moderate value ($${propertyValue.toLocaleString()}): +70 points - MODERATE BUDGET`);
    } else if (propertyValue >= 300000) {
      valueScore = 50;
      propertyReasons.push(`Lower value ($${propertyValue.toLocaleString()}): +50 points - LIMITED BUDGET`);
    } else if (propertyValue >= 200000) {
      valueScore = 30;
      propertyReasons.push(`Low value ($${propertyValue.toLocaleString()}): +30 points - LOW BUDGET`);
    } else {
      valueScore = 10;
      propertyReasons.push(`Very low value ($${propertyValue.toLocaleString()}): +10 points - MINIMAL BUDGET`);
    }
  } else {
    valueScore = 30; // Default for unknown value
    propertyReasons.push(`Unknown property value: +30 points (default)`);
  }
  
  // 3. PROPERTY SIZE (More to Maintain) (0-100 points)
  let sizeScore = 0;
  if ($json.building_sqft !== undefined && $json.building_sqft !== null) {
    const buildingSqft = parseInt($json.building_sqft);
    
    if (buildingSqft >= 4000) {
      sizeScore = 100; // Large home - lots of work potential
      propertyReasons.push(`Large home (${buildingSqft.toLocaleString()} sqft): +100 points - LOTS OF WORK POTENTIAL`);
    } else if (buildingSqft >= 3000) {
      sizeScore = 85;
      propertyReasons.push(`Big home (${buildingSqft.toLocaleString()} sqft): +85 points - BIG WORK POTENTIAL`);
    } else if (buildingSqft >= 2500) {
      sizeScore = 70;
      propertyReasons.push(`Good sized home (${buildingSqft.toLocaleString()} sqft): +70 points - GOOD WORK POTENTIAL`);
    } else if (buildingSqft >= 2000) {
      sizeScore = 60;
      propertyReasons.push(`Medium home (${buildingSqft.toLocaleString()} sqft): +60 points - MEDIUM WORK POTENTIAL`);
    } else if (buildingSqft >= 1500) {
      sizeScore = 40;
      propertyReasons.push(`Smaller home (${buildingSqft.toLocaleString()} sqft): +40 points - LIMITED WORK POTENTIAL`);
    } else {
      sizeScore = 20;
      propertyReasons.push(`Small home (${buildingSqft.toLocaleString()} sqft): +20 points - MINIMAL WORK POTENTIAL`);
    }
  } else {
    sizeScore = 40; // Default for unknown size
    propertyReasons.push(`Unknown property size: +40 points (default)`);
  }
  
  // 4. LOT SIZE (Exterior Work Potential) (0-100 points)
  let lotScore = 0;
  if ($json.lot_size_acres !== undefined && $json.lot_size_acres !== null) {
    const lotSizeAcres = parseFloat($json.lot_size_acres);
    
    if (lotSizeAcres >= 1.0) {
      lotScore = 100; // Large lot - massive exterior potential
      propertyReasons.push(`Large lot (${lotSizeAcres} acres): +100 points - MASSIVE EXTERIOR POTENTIAL`);
    } else if (lotSizeAcres >= 0.5) {
      lotScore = 85;
      propertyReasons.push(`Big lot (${lotSizeAcres} acres): +85 points - BIG EXTERIOR POTENTIAL`);
    } else if (lotSizeAcres >= 0.3) {
      lotScore = 70;
      propertyReasons.push(`Good sized lot (${lotSizeAcres} acres): +70 points - GOOD EXTERIOR POTENTIAL`);
    } else if (lotSizeAcres >= 0.2) {
      lotScore = 50;
      propertyReasons.push(`Medium lot (${lotSizeAcres} acres): +50 points - MEDIUM EXTERIOR POTENTIAL`);
    } else if (lotSizeAcres >= 0.1) {
      lotScore = 30;
      propertyReasons.push(`Small lot (${lotSizeAcres} acres): +30 points - LIMITED EXTERIOR POTENTIAL`);
    } else {
      lotScore = 10;
      propertyReasons.push(`Very small lot (${lotSizeAcres} acres): +10 points - MINIMAL EXTERIOR POTENTIAL`);
    }
  } else {
    lotScore = 30; // Default for unknown lot size
    propertyReasons.push(`Unknown lot size: +30 points (default)`);
  }
  
  // 5. PROPERTY TYPE (Work Potential) (0-90 points)
  let typeScore = 0;
  if ($json.property_type !== undefined && $json.property_type !== null) {
    const propertyType = $json.property_type.toLowerCase();
    
    if (propertyType === 'single family' || propertyType === 'single-family') {
      typeScore = 90; // Best for all types of work
      propertyReasons.push(`Single family home: +90 points - BEST WORK POTENTIAL (all types of work)`);
    } else if (propertyType === 'townhouse' || propertyType === 'town house') {
      typeScore = 60; // Good for some work
      propertyReasons.push(`Townhouse: +60 points - GOOD WORK POTENTIAL (some limitations)`);
    } else if (propertyType === 'condo' || propertyType === 'condominium') {
      typeScore = 20; // Limited work possible
      propertyReasons.push(`Condo: +20 points - LIMITED WORK POTENTIAL (many restrictions)`);
    } else {
      typeScore = 40; // Default for other types
      propertyReasons.push(`Other property type (${$json.property_type}): +40 points - MODERATE WORK POTENTIAL`);
    }
  } else {
    typeScore = 40; // Default for unknown type
    propertyReasons.push(`Unknown property type: +40 points (default)`);
  }
  
  // 6. SPECIAL FEATURES (Additional Work Potential) (0-40 points)
  let featuresBonus = 0;
  
  if ($json.has_pool === true) {
    featuresBonus += 15;
    propertyReasons.push(`Has pool: +15 points - POOL MAINTENANCE & LANDSCAPING NEEDS`);
  }
  
  if ($json.has_deck === true) {
    featuresBonus += 10;
    propertyReasons.push(`Has deck: +10 points - DECK MAINTENANCE & REPAIR NEEDS`);
  }
  
  if ($json.has_basement === true) {
    featuresBonus += 10;
    propertyReasons.push(`Has basement: +10 points - BASEMENT WORK POTENTIAL`);
  }
  
  if ($json.garage_count !== undefined && parseInt($json.garage_count) >= 2) {
    featuresBonus += 5;
    propertyReasons.push(`${$json.garage_count} car garage: +5 points - GARAGE WORK POTENTIAL`);
  }
  
  // 7. HOA (Maintenance Standards) (0-15 points)
  let hoaBonus = 0;
  if ($json.has_hoa === true) {
    hoaBonus = 15; // HOA properties often require services
    propertyReasons.push(`HOA property: +15 points - MAINTENANCE STANDARDS & REQUIREMENTS`);
  } else {
    hoaBonus = 0;
    propertyReasons.push(`No HOA: +0 points - NO EXTERNAL MAINTENANCE REQUIREMENTS`);
  }
  
  // 8. CALCULATE FINAL PROPERTY SCORE
  const rawScore = ageScore + valueScore + sizeScore + lotScore + typeScore + featuresBonus + hoaBonus;
  
  // Normalize to 0-100 scale (530 max becomes 100)
  propertyScore = Math.round((rawScore / 530) * 100);
  
  // Ensure bounds
  propertyScore = Math.min(propertyScore, 100);
  propertyScore = Math.max(propertyScore, 0);
  
  // Add summary to reasons
  propertyReasons.push(`Raw Score: ${rawScore}/530 → Normalized: ${propertyScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including enhanced urgency_score)
      property_score: propertyScore,
      property_reasons: propertyReasons,
      property_breakdown: {
        age_score: ageScore,
        value_score: valueScore,
        size_score: sizeScore,
        lot_score: lotScore,
        type_score: typeScore,
        features_bonus: featuresBonus,
        hoa_bonus: hoaBonus,
        raw_score: rawScore,
        normalized_score: propertyScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Enhanced Property Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      property_score: 30, // Safe default score
      property_reasons: [
        "Error in property calculation: +30 points (default)",
        "Check data quality and try again"
      ],
      property_breakdown: {
        age_score: 10,
        value_score: 10,
        size_score: 10,
        lot_score: 10,
        type_score: 10,
        features_bonus: 0,
        hoa_bonus: 0,
        raw_score: 50,
        normalized_score: 30
      },
      error: error.message
    }
  }];
}
