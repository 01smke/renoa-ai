// FIXED PROPERTY MODULE - Processes ALL items, not just the first one
// This works with "Run Once for All Items" mode

try {
  console.log("=== FIXED PROPERTY MODULE START ===");
  
  // Get all input items
  const allItems = $input.all();
  console.log("Processing", allItems.length, "leads for property scoring");
  
  // Process each item
  const processedItems = allItems.map((item, index) => {
    console.log(`Processing lead ${index + 1}: ${item.json.contact_name}`);
    
    // Initialize variables for this lead
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
    const yearBuilt = utils.validateNumericInput(item.json.year_built, 2000, 1800, currentYear);
    const propertyAge = currentYear - yearBuilt;
    
    if (propertyAge >= 25) {
      ageScore = 100;
      propertyReasons.push(`Very old property (${propertyAge} years): +100 points - HIGH RENOVATION NEEDS`);
    } else if (propertyAge >= 20) {
      ageScore = 90;
      propertyReasons.push(`Old property (${propertyAge} years): +90 points - HIGH RENOVATION NEEDS`);
    } else if (propertyAge >= 15) {
      ageScore = 75;
      propertyReasons.push(`Moderate age property (${propertyAge} years): +75 points - SOME RENOVATION NEEDS`);
    } else if (propertyAge >= 10) {
      ageScore = 50;
      propertyReasons.push(`Property age ${propertyAge} years: +50 points - MODERATE MAINTENANCE NEEDS`);
    } else if (propertyAge >= 5) {
      ageScore = 25;
      propertyReasons.push(`New property (${propertyAge} years): +25 points - MINIMAL MAINTENANCE NEEDS`);
    } else {
      ageScore = 10;
      propertyReasons.push(`Very new property (${propertyAge} years): +10 points - MINIMAL MAINTENANCE NEEDS`);
    }
    
    utils.logCalculationStep('age_scoring', `${yearBuilt} (age: ${propertyAge})`, ageScore, 'Property age-based renovation need scoring');
    
    // 2. PROPERTY VALUE (Wealth Indicator) (0-100 points)
    let valueScore = 0;
    const propertyValue = utils.validateNumericInput(item.json.property_value, 0, 0, 10000000);
    
    if (propertyValue >= 800000) {
      valueScore = 100;
      propertyReasons.push(`Premium property ($${propertyValue.toLocaleString()}): +100 points - HIGH SPENDING CAPACITY`);
    } else if (propertyValue >= 600000) {
      valueScore = 85;
      propertyReasons.push(`High-value property ($${propertyValue.toLocaleString()}): +85 points - HIGH SPENDING CAPACITY`);
    } else if (propertyValue >= 500000) {
      valueScore = 75;
      propertyReasons.push(`Good-value property ($${propertyValue.toLocaleString()}): +75 points - GOOD SPENDING CAPACITY`);
    } else if (propertyValue >= 400000) {
      valueScore = 65;
      propertyReasons.push(`Moderate-value property ($${propertyValue.toLocaleString()}): +65 points - MODERATE SPENDING CAPACITY`);
    } else if (propertyValue >= 300000) {
      valueScore = 50;
      propertyReasons.push(`Lower-value property ($${propertyValue.toLocaleString()}): +50 points - LIMITED SPENDING CAPACITY`);
    } else if (propertyValue >= 200000) {
      valueScore = 30;
      propertyReasons.push(`Low-value property ($${propertyValue.toLocaleString()}): +30 points - LOW SPENDING CAPACITY`);
    } else {
      valueScore = 15;
      propertyReasons.push(`Very low-value property ($${propertyValue.toLocaleString()}): +15 points - MINIMAL SPENDING CAPACITY`);
    }
    
    utils.logCalculationStep('value_scoring', propertyValue, valueScore, 'Property value-based spending capacity scoring');
    
    // 3. PROPERTY SIZE (More to Maintain) (0-100 points)
    let sizeScore = 0;
    const buildingSqft = utils.validateNumericInput(item.json.building_sqft, 0, 0, 50000);
    
    if (buildingSqft >= 4000) {
      sizeScore = 100;
      propertyReasons.push(`Large building (${buildingSqft.toLocaleString()} sqft): +100 points - HIGH MAINTENANCE NEEDS`);
    } else if (buildingSqft >= 3000) {
      sizeScore = 85;
      propertyReasons.push(`Large building (${buildingSqft.toLocaleString()} sqft): +85 points - HIGH MAINTENANCE NEEDS`);
    } else if (buildingSqft >= 2500) {
      sizeScore = 75;
      propertyReasons.push(`Good-sized building (${buildingSqft.toLocaleString()} sqft): +75 points - MODERATE MAINTENANCE NEEDS`);
    } else if (buildingSqft >= 2000) {
      sizeScore = 60;
      propertyReasons.push(`Average-sized building (${buildingSqft.toLocaleString()} sqft): +60 points - MODERATE MAINTENANCE NEEDS`);
    } else if (buildingSqft >= 1500) {
      sizeScore = 40;
      propertyReasons.push(`Smaller building (${buildingSqft.toLocaleString()} sqft): +40 points - LOW MAINTENANCE NEEDS`);
    } else if (buildingSqft >= 1000) {
      sizeScore = 25;
      propertyReasons.push(`Small building (${buildingSqft.toLocaleString()} sqft): +25 points - LOW MAINTENANCE NEEDS`);
    } else {
      sizeScore = 10;
      propertyReasons.push(`Very small building (${buildingSqft.toLocaleString()} sqft): +10 points - MINIMAL MAINTENANCE NEEDS`);
    }
    
    // 4. LOT SIZE BONUS (0-15 points)
    let lotSizeBonus = 0;
    const lotSizeSqft = utils.validateNumericInput(item.json.lot_size_sqft, 0, 0, 1000000);
    
    if (lotSizeSqft >= 20000) {
      lotSizeBonus = 15;
      propertyReasons.push(`Large lot (${lotSizeSqft.toLocaleString()} sqft): +15 points - HIGH LANDSCAPING NEEDS`);
    } else if (lotSizeSqft >= 15000) {
      lotSizeBonus = 12;
      propertyReasons.push(`Good-sized lot (${lotSizeSqft.toLocaleString()} sqft): +12 points - MODERATE LANDSCAPING NEEDS`);
    } else if (lotSizeSqft >= 10000) {
      lotSizeBonus = 8;
      propertyReasons.push(`Average lot (${lotSizeSqft.toLocaleString()} sqft): +8 points - MODERATE LANDSCAPING NEEDS`);
    } else if (lotSizeSqft >= 5000) {
      lotSizeBonus = 5;
      propertyReasons.push(`Smaller lot (${lotSizeSqft.toLocaleString()} sqft): +5 points - LOW LANDSCAPING NEEDS`);
    } else {
      lotSizeBonus = 0;
      propertyReasons.push(`Small lot (${lotSizeSqft.toLocaleString()} sqft): +0 points - MINIMAL LANDSCAPING NEEDS`);
    }
    
    utils.logCalculationStep('size_scoring', `${buildingSqft}/${lotSizeSqft}`, `${sizeScore}+${lotSizeBonus}`, 'Building and lot size scoring');
    
    // 5. PROPERTY TYPE (Maintenance Requirements) (0-15 points)
    let typeScore = 0;
    const propertyType = item.json.property_type || 'Single Family';
    
    if (propertyType.toLowerCase().includes('single family') || propertyType.toLowerCase().includes('single-family')) {
      typeScore = 15;
      propertyReasons.push(`Single family home: +15 points - HIGHEST MAINTENANCE REQUIREMENTS`);
    } else if (propertyType.toLowerCase().includes('townhouse') || propertyType.toLowerCase().includes('townhouse')) {
      typeScore = 12;
      propertyReasons.push(`Townhouse: +12 points - HIGH MAINTENANCE REQUIREMENTS`);
    } else if (propertyType.toLowerCase().includes('condo') || propertyType.toLowerCase().includes('condominium')) {
      typeScore = 8;
      propertyReasons.push(`Condo: +8 points - MODERATE MAINTENANCE REQUIREMENTS`);
    } else if (propertyType.toLowerCase().includes('multi') || propertyType.toLowerCase().includes('duplex')) {
      typeScore = 10;
      propertyReasons.push(`Multi-family: +10 points - MODERATE MAINTENANCE REQUIREMENTS`);
    } else {
      typeScore = 5;
      propertyReasons.push(`${propertyType}: +5 points - MINIMAL MAINTENANCE REQUIREMENTS`);
    }
    
    utils.logCalculationStep('type_scoring', propertyType, typeScore, 'Property type-based maintenance requirement scoring');
    
    // 6. BEDROOMS/ROOMS (Maintenance Complexity) (0-10 points)
    let roomsScore = 0;
    const bedrooms = utils.validateNumericInput(item.json.bedrooms, 0, 0, 20);
    const bathrooms = utils.validateNumericInput(item.json.bathrooms, 0, 0, 20);
    const totalRooms = bedrooms + bathrooms;
    
    if (totalRooms >= 8) {
      roomsScore = 10;
      propertyReasons.push(`Many rooms (${bedrooms} bed, ${bathrooms} bath): +10 points - HIGH MAINTENANCE COMPLEXITY`);
    } else if (totalRooms >= 6) {
      roomsScore = 8;
      propertyReasons.push(`Good number of rooms (${bedrooms} bed, ${bathrooms} bath): +8 points - MODERATE MAINTENANCE COMPLEXITY`);
    } else if (totalRooms >= 4) {
      roomsScore = 6;
      propertyReasons.push(`Average rooms (${bedrooms} bed, ${bathrooms} bath): +6 points - MODERATE MAINTENANCE COMPLEXITY`);
    } else if (totalRooms >= 2) {
      roomsScore = 4;
      propertyReasons.push(`Fewer rooms (${bedrooms} bed, ${bathrooms} bath): +4 points - LOW MAINTENANCE COMPLEXITY`);
    } else {
      roomsScore = 2;
      propertyReasons.push(`Very few rooms (${bedrooms} bed, ${bathrooms} bath): +2 points - MINIMAL MAINTENANCE COMPLEXITY`);
    }
    
    utils.logCalculationStep('rooms_scoring', `${bedrooms}+${bathrooms}=${totalRooms}`, roomsScore, 'Room count-based maintenance complexity scoring');
    
    // Calculate total property score with precise rounding
    const rawScore = ageScore + valueScore + sizeScore + lotSizeBonus + typeScore + roomsScore;
    propertyScore = utils.roundScore(rawScore);
    
    utils.logCalculationStep('total_calculation', 
      `Age(${ageScore}) + Value(${valueScore}) + Size(${sizeScore}+${lotSizeBonus}) + Type(${typeScore}) + Rooms(${roomsScore})`, 
      propertyScore, 
      'Final property score calculation');
    
    // Build comprehensive reasons
    propertyReasons.push(`=== PROPERTY CHARACTERISTICS SCORE: ${propertyScore}/100 ===`);
    propertyReasons.push(`Age: ${ageScore} + Value: ${valueScore} + Size: ${sizeScore + lotSizeBonus} + Type: ${typeScore} + Rooms: ${roomsScore} = ${propertyScore}`);
    
    // Return the result for this lead
    return {
      json: {
        ...item.json, // Preserve all original data
        
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
    };
  });
  
  console.log("=== FIXED PROPERTY MODULE END ===");
  console.log("Returning", processedItems.length, "processed leads");
  
  // Return all processed items
  return processedItems;
  
} catch (error) {
  console.error('Error in Fixed Property Module:', error);
  
  // Return error for all items
  const allItems = $input.all();
  return allItems.map((item) => ({
    json: {
      ...item.json,
      property_score: 0,
      property_reasons: [`Error in property calculation: ${error.message}`],
      error: error.message
    }
  }));
}
