// DETERMINISTIC PROPERTY CHARACTERISTICS MODULE
// Uses consistent rounding and validation for reproducible results

try {
  // Initialize variables
  let propertyScore = 0;
  let propertyReasons = [];
  
  // Initialize calculation log
  const calculationLog = [];
  
  // Utility functions for consistent calculations
  const utils = {
    roundScore: (value) => Math.max(0, Math.min(100, Math.round(value))),
    validateNumericInput: (value, defaultValue = 0, min = 0, max = Infinity) => {
      const numValue = parseInt(value);
      return (isNaN(numValue) || numValue < min || numValue > max) ? defaultValue : numValue;
    },
    logCalculationStep: (step, input, output, reason = '') => {
      const logEntry = { step, input, output, reason, timestamp: new Date().toISOString() };
      calculationLog.push(logEntry);
      return logEntry;
    }
  };
  
  // 1. PROPERTY AGE (Renovation Need Indicator) (0-100 points)
  let ageScore = 0;
  const currentYear = 2024; // Fixed reference year for consistency
  const yearBuilt = utils.validateNumericInput($json.year_built, 2000, 1800, currentYear);
  const propertyAge = currentYear - yearBuilt;
  
  if (propertyAge >= 25) {
    ageScore = 100; // Very old property - high renovation needs
    propertyReasons.push(`Very old property (${propertyAge} years): +100 points - HIGH RENOVATION NEEDS`);
  } else if (propertyAge >= 20) {
    ageScore = 90; // Old property - high renovation needs
    propertyReasons.push(`Old property (${propertyAge} years): +90 points - HIGH RENOVATION NEEDS`);
  } else if (propertyAge >= 15) {
    ageScore = 75; // Moderate age - some renovation needs
    propertyReasons.push(`Moderate age property (${propertyAge} years): +75 points - SOME RENOVATION NEEDS`);
  } else if (propertyAge >= 10) {
    ageScore = 50; // Either well-maintained or neglected
    propertyReasons.push(`Property age ${propertyAge} years: +50 points - MODERATE MAINTENANCE NEEDS`);
  } else if (propertyAge >= 5) {
    ageScore = 25; // Relatively new - minimal needs
    propertyReasons.push(`New property (${propertyAge} years): +25 points - MINIMAL MAINTENANCE NEEDS`);
  } else {
    ageScore = 10; // Very new - minimal needs
    propertyReasons.push(`Very new property (${propertyAge} years): +10 points - MINIMAL MAINTENANCE NEEDS`);
  }
  
  utils.logCalculationStep('age_scoring', `${yearBuilt} (age: ${propertyAge})`, ageScore, 'Property age-based renovation need scoring');
  
  // 2. PROPERTY VALUE (Wealth Indicator) (0-100 points)
  let valueScore = 0;
  const propertyValue = utils.validateNumericInput($json.property_value, 0, 0, 10000000);
  
  if (propertyValue >= 800000) {
    valueScore = 100; // Premium property - high spending capacity
    propertyReasons.push(`Premium property ($${propertyValue.toLocaleString()}): +100 points - HIGH SPENDING CAPACITY`);
  } else if (propertyValue >= 600000) {
    valueScore = 85; // High-value property
    propertyReasons.push(`High-value property ($${propertyValue.toLocaleString()}): +85 points - HIGH SPENDING CAPACITY`);
  } else if (propertyValue >= 500000) {
    valueScore = 75; // Good-value property
    propertyReasons.push(`Good-value property ($${propertyValue.toLocaleString()}): +75 points - GOOD SPENDING CAPACITY`);
  } else if (propertyValue >= 400000) {
    valueScore = 65; // Moderate-value property
    propertyReasons.push(`Moderate-value property ($${propertyValue.toLocaleString()}): +65 points - MODERATE SPENDING CAPACITY`);
  } else if (propertyValue >= 300000) {
    valueScore = 50; // Lower-value property
    propertyReasons.push(`Lower-value property ($${propertyValue.toLocaleString()}): +50 points - LIMITED SPENDING CAPACITY`);
  } else if (propertyValue >= 200000) {
    valueScore = 30; // Low-value property
    propertyReasons.push(`Low-value property ($${propertyValue.toLocaleString()}): +30 points - LOW SPENDING CAPACITY`);
  } else {
    valueScore = 15; // Very low-value property
    propertyReasons.push(`Very low-value property ($${propertyValue.toLocaleString()}): +15 points - MINIMAL SPENDING CAPACITY`);
  }
  
  utils.logCalculationStep('value_scoring', propertyValue, valueScore, 'Property value-based spending capacity scoring');
  
  // 3. PROPERTY SIZE (More to Maintain) (0-100 points)
  let sizeScore = 0;
  const buildingSqft = utils.validateNumericInput($json.building_sqft, 0, 0, 50000);
  const lotSizeSqft = utils.validateNumericInput($json.lot_size_sqft, 0, 0, 1000000);
  
  // Building size scoring
  if (buildingSqft >= 4000) {
    sizeScore = 100; // Large building - high maintenance needs
    propertyReasons.push(`Large building (${buildingSqft.toLocaleString()} sqft): +100 points - HIGH MAINTENANCE NEEDS`);
  } else if (buildingSqft >= 3000) {
    sizeScore = 85; // Large building
    propertyReasons.push(`Large building (${buildingSqft.toLocaleString()} sqft): +85 points - HIGH MAINTENANCE NEEDS`);
  } else if (buildingSqft >= 2500) {
    sizeScore = 75; // Good-sized building
    propertyReasons.push(`Good-sized building (${buildingSqft.toLocaleString()} sqft): +75 points - MODERATE MAINTENANCE NEEDS`);
  } else if (buildingSqft >= 2000) {
    sizeScore = 60; // Average-sized building
    propertyReasons.push(`Average-sized building (${buildingSqft.toLocaleString()} sqft): +60 points - MODERATE MAINTENANCE NEEDS`);
  } else if (buildingSqft >= 1500) {
    sizeScore = 40; // Smaller building
    propertyReasons.push(`Smaller building (${buildingSqft.toLocaleString()} sqft): +40 points - LOW MAINTENANCE NEEDS`);
  } else if (buildingSqft >= 1000) {
    sizeScore = 25; // Small building
    propertyReasons.push(`Small building (${buildingSqft.toLocaleString()} sqft): +25 points - LOW MAINTENANCE NEEDS`);
  } else {
    sizeScore = 10; // Very small building
    propertyReasons.push(`Very small building (${buildingSqft.toLocaleString()} sqft): +10 points - MINIMAL MAINTENANCE NEEDS`);
  }
  
  // Lot size bonus (0-15 points)
  let lotSizeBonus = 0;
  if (lotSizeSqft >= 20000) {
    lotSizeBonus = 15; // Large lot - high landscaping needs
    propertyReasons.push(`Large lot (${lotSizeSqft.toLocaleString()} sqft): +15 points - HIGH LANDSCAPING NEEDS`);
  } else if (lotSizeSqft >= 15000) {
    lotSizeBonus = 12; // Good-sized lot
    propertyReasons.push(`Good-sized lot (${lotSizeSqft.toLocaleString()} sqft): +12 points - MODERATE LANDSCAPING NEEDS`);
  } else if (lotSizeSqft >= 10000) {
    lotSizeBonus = 8; // Average lot
    propertyReasons.push(`Average lot (${lotSizeSqft.toLocaleString()} sqft): +8 points - MODERATE LANDSCAPING NEEDS`);
  } else if (lotSizeSqft >= 5000) {
    lotSizeBonus = 5; // Smaller lot
    propertyReasons.push(`Smaller lot (${lotSizeSqft.toLocaleString()} sqft): +5 points - LOW LANDSCAPING NEEDS`);
  } else {
    lotSizeBonus = 0;
    propertyReasons.push(`Small lot (${lotSizeSqft.toLocaleString()} sqft): +0 points - MINIMAL LANDSCAPING NEEDS`);
  }
  
  utils.logCalculationStep('size_scoring', `${buildingSqft}/${lotSizeSqft}`, `${sizeScore}+${lotSizeBonus}`, 'Building and lot size scoring');
  
  // 4. PROPERTY TYPE (Maintenance Requirements) (0-15 points)
  let typeScore = 0;
  const propertyType = $json.property_type || 'Single Family';
  
  if (propertyType.toLowerCase().includes('single family') || propertyType.toLowerCase().includes('single-family')) {
    typeScore = 15; // Single family - highest maintenance needs
    propertyReasons.push(`Single family home: +15 points - HIGHEST MAINTENANCE REQUIREMENTS`);
  } else if (propertyType.toLowerCase().includes('townhouse') || propertyType.toLowerCase().includes('townhouse')) {
    typeScore = 12; // Townhouse - high maintenance needs
    propertyReasons.push(`Townhouse: +12 points - HIGH MAINTENANCE REQUIREMENTS`);
  } else if (propertyType.toLowerCase().includes('condo') || propertyType.toLowerCase().includes('condominium')) {
    typeScore = 8; // Condo - moderate maintenance needs
    propertyReasons.push(`Condo: +8 points - MODERATE MAINTENANCE REQUIREMENTS`);
  } else if (propertyType.toLowerCase().includes('multi') || propertyType.toLowerCase().includes('duplex')) {
    typeScore = 10; // Multi-family - moderate maintenance needs
    propertyReasons.push(`Multi-family: +10 points - MODERATE MAINTENANCE REQUIREMENTS`);
  } else {
    typeScore = 5; // Other types - minimal maintenance needs
    propertyReasons.push(`${propertyType}: +5 points - MINIMAL MAINTENANCE REQUIREMENTS`);
  }
  
  utils.logCalculationStep('type_scoring', propertyType, typeScore, 'Property type-based maintenance requirement scoring');
  
  // 5. BEDROOMS/ROOMS (Maintenance Complexity) (0-10 points)
  let roomsScore = 0;
  const bedrooms = utils.validateNumericInput($json.bedrooms, 0, 0, 20);
  const bathrooms = utils.validateNumericInput($json.bathrooms, 0, 0, 20);
  const totalRooms = bedrooms + bathrooms;
  
  if (totalRooms >= 8) {
    roomsScore = 10; // Many rooms - high maintenance complexity
    propertyReasons.push(`Many rooms (${bedrooms} bed, ${bathrooms} bath): +10 points - HIGH MAINTENANCE COMPLEXITY`);
  } else if (totalRooms >= 6) {
    roomsScore = 8; // Good number of rooms
    propertyReasons.push(`Good number of rooms (${bedrooms} bed, ${bathrooms} bath): +8 points - MODERATE MAINTENANCE COMPLEXITY`);
  } else if (totalRooms >= 4) {
    roomsScore = 6; // Average number of rooms
    propertyReasons.push(`Average rooms (${bedrooms} bed, ${bathrooms} bath): +6 points - MODERATE MAINTENANCE COMPLEXITY`);
  } else if (totalRooms >= 2) {
    roomsScore = 4; // Fewer rooms
    propertyReasons.push(`Fewer rooms (${bedrooms} bed, ${bathrooms} bath): +4 points - LOW MAINTENANCE COMPLEXITY`);
  } else {
    roomsScore = 2; // Very few rooms
    propertyReasons.push(`Very few rooms (${bedrooms} bed, ${bathrooms} bath): +2 points - MINIMAL MAINTENANCE COMPLEXITY`);
  }
  
  utils.logCalculationStep('rooms_scoring', `${bedrooms}+${bathrooms}=${totalRooms}`, roomsScore, 'Room count-based maintenance complexity scoring');
  
  // 6. AMENITIES (Maintenance Needs) (0-15 points)
  let amenitiesScore = 0;
  const hasPool = $json.has_pool === true;
  const hasDeck = $json.has_deck === true;
  const hasBasement = $json.has_basement === true;
  const numGarages = utils.validateNumericInput($json.num_garages, 0, 0, 10);
  
  if (hasPool) {
    amenitiesScore += 15; // Pool requires significant maintenance
    propertyReasons.push(`Has pool: +15 points - POOL MAINTENANCE & LANDSCAPING NEEDS`);
  }
  
  if (hasDeck) {
    amenitiesScore += 10; // Deck requires maintenance
    propertyReasons.push(`Has deck: +10 points - DECK MAINTENANCE & REPAIR NEEDS`);
  }
  
  if (hasBasement) {
    amenitiesScore += 8; // Basement requires maintenance
    propertyReasons.push(`Has basement: +8 points - BASEMENT MAINTENANCE NEEDS`);
  }
  
  if (numGarages >= 3) {
    amenitiesScore += 5; // Multiple garages
    propertyReasons.push(`${numGarages} garages: +5 points - GARAGE MAINTENANCE NEEDS`);
  } else if (numGarages >= 2) {
    amenitiesScore += 3; // Double garage
    propertyReasons.push(`${numGarages} garages: +3 points - GARAGE MAINTENANCE NEEDS`);
  } else if (numGarages >= 1) {
    amenitiesScore += 1; // Single garage
    propertyReasons.push(`${numGarages} garage: +1 points - GARAGE MAINTENANCE NEEDS`);
  }
  
  utils.logCalculationStep('amenities_scoring', `Pool:${hasPool}, Deck:${hasDeck}, Basement:${hasBasement}, Garages:${numGarages}`, amenitiesScore, 'Amenities-based maintenance needs scoring');
  
  // 7. HOA (Maintenance Standards) (0-15 points)
  let hoaScore = 0;
  const hasHoa = $json.has_hoa === true;
  
  if (hasHoa) {
    hoaScore = 15; // HOA enforces maintenance standards
    propertyReasons.push(`HOA property: +15 points - MAINTENANCE STANDARDS & REQUIREMENTS`);
  } else {
    hoaScore = 0; // No external maintenance requirements
    propertyReasons.push(`No HOA: +0 points - NO EXTERNAL MAINTENANCE REQUIREMENTS`);
  }
  
  utils.logCalculationStep('hoa_scoring', hasHoa, hoaScore, 'HOA-based maintenance requirement scoring');
  
  // Calculate total property score with precise rounding
  const rawScore = ageScore + valueScore + sizeScore + lotSizeBonus + typeScore + roomsScore + amenitiesScore + hoaScore;
  propertyScore = utils.roundScore(rawScore);
  
  utils.logCalculationStep('total_calculation', 
    `Age(${ageScore}) + Value(${valueScore}) + Size(${sizeScore}+${lotSizeBonus}) + Type(${typeScore}) + Rooms(${roomsScore}) + Amenities(${amenitiesScore}) + HOA(${hoaScore})`, 
    propertyScore, 
    'Final property score calculation');
  
  // Build comprehensive reasons
  propertyReasons.push(`=== PROPERTY CHARACTERISTICS SCORE: ${propertyScore}/100 ===`);
  propertyReasons.push(`Age: ${ageScore} + Value: ${valueScore} + Size: ${sizeScore + lotSizeBonus} + Type: ${typeScore} + Rooms: ${roomsScore} + Amenities: ${amenitiesScore} + HOA: ${hoaScore} = ${propertyScore}`);
  
  // Return the result with calculation log
  return [{
    json: {
      ...$json, // Preserve all original data
      
      // Property scoring results
      property_score: propertyScore,
      property_reasons: propertyReasons,
      
      // Detailed breakdown
      property_breakdown: {
        age_score: ageScore,
        value_score: valueScore,
        size_score: sizeScore,
        lot_size_bonus: lotSizeBonus,
        type_score: typeScore,
        rooms_score: roomsScore,
        amenities_score: amenitiesScore,
        hoa_score: hoaScore,
        total_property_score: propertyScore,
        reference_year: currentYear
      },
      
      // Calculation log for debugging
      calculation_log: calculationLog,
      
      // Validation metadata
      validation_metadata: {
        deterministic: true,
        fixed_reference_year: currentYear,
        rounding_applied: true,
        random_functions_eliminated: true
      }
    }
  }];
  
} catch (error) {
  // Error handling with deterministic defaults
  console.error('Error in Deterministic Property Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      property_score: 40, // Safe default score
      property_reasons: [
        "Error in property calculation: defaulting to 40 points (deterministic fallback)",
        "Check data quality and try again",
        `Error: ${error.message}`
      ],
      property_breakdown: {
        age_score: 40,
        value_score: 40,
        size_score: 0,
        lot_size_bonus: 0,
        type_score: 0,
        rooms_score: 0,
        amenities_score: 0,
        hoa_score: 0,
        total_property_score: 40,
        error: error.message
      },
      calculation_log: [{ error: error.message, timestamp: new Date().toISOString() }],
      validation_metadata: {
        deterministic: false,
        error: error.message
      },
      error: error.message
    }
  }];
}
