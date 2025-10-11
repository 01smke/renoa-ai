// FIXED DEMOGRAPHIC MODULE - Processes ALL items, not just the first one
// This works with "Run Once for All Items" mode

try {
  console.log("=== FIXED DEMOGRAPHIC MODULE START ===");
  
  // Get all input items
  const allItems = $input.all();
  console.log("Processing", allItems.length, "leads for demographic scoring");
  
  // Process each item
  const processedItems = allItems.map((item, index) => {
    console.log(`Processing lead ${index + 1}: ${item.json.contact_name}`);
    
    // Initialize variables for this lead
    let demographicScore = 0;
    let demographicReasons = [];
    
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
    
    // 1. FAMILY SIZE (Spending Motivation) (0-100 points)
    let familyScore = 0;
    const familySize = utils.validateNumericInput(item.json.family_size, 1, 1, 20);
    
    if (familySize >= 5) {
      familyScore = 100;
      demographicReasons.push(`Large family (${familySize} members): +100 points - HIGH MAINTENANCE & IMPROVEMENT NEEDS`);
    } else if (familySize >= 4) {
      familyScore = 85;
      demographicReasons.push(`Family with children (${familySize} members): +85 points - HIGH MAINTENANCE & IMPROVEMENT NEEDS`);
    } else if (familySize >= 3) {
      familyScore = 70;
      demographicReasons.push(`Small family (${familySize} members): +70 points - MODERATE MAINTENANCE & IMPROVEMENT NEEDS`);
    } else if (familySize >= 2) {
      familyScore = 50;
      demographicReasons.push(`Couple (${familySize} members): +50 points - MODERATE MAINTENANCE & IMPROVEMENT NEEDS`);
    } else {
      familyScore = 25;
      demographicReasons.push(`Single person (${familySize} member): +25 points - LOWER MAINTENANCE & IMPROVEMENT NEEDS`);
    }
    
    utils.logCalculationStep('family_scoring', familySize, familyScore, 'Family size-based maintenance need scoring');
    
    // 2. SCHOOL RATING (Neighborhood Quality) (0-100 points)
    let schoolScore = 0;
    const schoolRating = utils.validateNumericInput(item.json.school_rating, 5, 1, 10);
    
    if (schoolRating >= 9) {
      schoolScore = 100;
      demographicReasons.push(`Excellent schools (${schoolRating}/10): +100 points - HIGH PROPERTY PRIDE & MAINTENANCE`);
    } else if (schoolRating >= 8) {
      schoolScore = 85;
      demographicReasons.push(`Very good schools (${schoolRating}/10): +85 points - HIGH PROPERTY PRIDE & MAINTENANCE`);
    } else if (schoolRating >= 7) {
      schoolScore = 70;
      demographicReasons.push(`Good schools (${schoolRating}/10): +70 points - GOOD PROPERTY PRIDE & MAINTENANCE`);
    } else if (schoolRating >= 6) {
      schoolScore = 55;
      demographicReasons.push(`Average schools (${schoolRating}/10): +55 points - MODERATE PROPERTY PRIDE & MAINTENANCE`);
    } else if (schoolRating >= 5) {
      schoolScore = 40;
      demographicReasons.push(`Below average schools (${schoolRating}/10): +40 points - LOWER PROPERTY PRIDE & MAINTENANCE`);
    } else {
      schoolScore = 25;
      demographicReasons.push(`Poor schools (${schoolRating}/10): +25 points - LOW PROPERTY PRIDE & MAINTENANCE`);
    }
    
    utils.logCalculationStep('school_scoring', schoolRating, schoolScore, 'School rating-based property pride scoring');
    
    // 3. NEIGHBORHOOD TYPE (Spending Behavior) (0-50 points)
    let neighborhoodScore = 0;
    const neighborhoodType = item.json.neighborhood_type || 'suburban';
    
    if (neighborhoodType.toLowerCase().includes('suburban')) {
      neighborhoodScore = 50;
      demographicReasons.push(`Suburban neighborhood: +50 points - HIGH SPENDING ON HOME IMPROVEMENTS`);
    } else if (neighborhoodType.toLowerCase().includes('urban')) {
      neighborhoodScore = 40;
      demographicReasons.push(`Urban neighborhood: +40 points - MODERATE SPENDING ON HOME IMPROVEMENTS`);
    } else if (neighborhoodType.toLowerCase().includes('rural')) {
      neighborhoodScore = 35;
      demographicReasons.push(`Rural neighborhood: +35 points - SOME SPENDING ON HOME IMPROVEMENTS`);
    } else if (neighborhoodType.toLowerCase().includes('gated')) {
      neighborhoodScore = 45;
      demographicReasons.push(`Gated community: +45 points - HIGH SPENDING ON HOME IMPROVEMENTS`);
    } else {
      neighborhoodScore = 30;
      demographicReasons.push(`${neighborhoodType} neighborhood: +30 points - MODERATE SPENDING ON HOME IMPROVEMENTS`);
    }
    
    utils.logCalculationStep('neighborhood_scoring', neighborhoodType, neighborhoodScore, 'Neighborhood type-based spending behavior scoring');
    
    // 4. NEIGHBORHOOD VALUE TREND (Pride Indicator) (0-30 points)
    let trendScore = 0;
    const neighborhoodValueTrend = item.json.neighborhood_value_trend || 'stable';
    
    if (neighborhoodValueTrend === 'increasing_fast') {
      trendScore = 30;
      demographicReasons.push(`Rapidly appreciating neighborhood: +30 points - HIGH PROPERTY PRIDE & MAINTENANCE`);
    } else if (neighborhoodValueTrend === 'increasing') {
      trendScore = 25;
      demographicReasons.push(`Appreciating neighborhood: +25 points - GOOD PROPERTY PRIDE & MAINTENANCE`);
    } else if (neighborhoodValueTrend === 'stable') {
      trendScore = 15;
      demographicReasons.push(`Stable neighborhood: +15 points - STABLE AREA = GOOD MAINTENANCE`);
    } else if (neighborhoodValueTrend === 'decreasing') {
      trendScore = 5;
      demographicReasons.push(`Declining neighborhood: +5 points - LOWER PROPERTY PRIDE & MAINTENANCE`);
    } else {
      trendScore = 10;
      demographicReasons.push(`Unknown neighborhood trend: +10 points - MODERATE PROPERTY PRIDE & MAINTENANCE`);
    }
    
    utils.logCalculationStep('trend_scoring', neighborhoodValueTrend, trendScore, 'Neighborhood value trend-based pride scoring');
    
    // 5. NEIGHBORHOOD MEDIAN INCOME (Peer Pressure) (0-25 points)
    let incomePeerScore = 0;
    const neighborhoodMedianIncome = utils.validateNumericInput(item.json.neighborhood_median_income, 0, 0, 500000);
    
    if (neighborhoodMedianIncome >= 150000) {
      incomePeerScore = 25;
      demographicReasons.push(`High-income neighborhood ($${neighborhoodMedianIncome.toLocaleString()}): +25 points - PEER PRESSURE TO MAINTAIN/IMPROVE`);
    } else if (neighborhoodMedianIncome >= 120000) {
      incomePeerScore = 20;
      demographicReasons.push(`Above-average income neighborhood ($${neighborhoodMedianIncome.toLocaleString()}): +20 points - PEER PRESSURE TO MAINTAIN/IMPROVE`);
    } else if (neighborhoodMedianIncome >= 100000) {
      incomePeerScore = 15;
      demographicReasons.push(`Good income neighborhood ($${neighborhoodMedianIncome.toLocaleString()}): +15 points - SOME PEER PRESSURE TO MAINTAIN/IMPROVE`);
    } else if (neighborhoodMedianIncome >= 80000) {
      incomePeerScore = 10;
      demographicReasons.push(`Average income neighborhood ($${neighborhoodMedianIncome.toLocaleString()}): +10 points - MODERATE PEER PRESSURE TO MAINTAIN/IMPROVE`);
    } else if (neighborhoodMedianIncome >= 60000) {
      incomePeerScore = 5;
      demographicReasons.push(`Below-average income neighborhood ($${neighborhoodMedianIncome.toLocaleString()}): +5 points - LOWER PEER PRESSURE TO MAINTAIN/IMPROVE`);
    } else {
      incomePeerScore = 0;
      demographicReasons.push(`Low income neighborhood ($${neighborhoodMedianIncome.toLocaleString()}): +0 points - MINIMAL PEER PRESSURE TO MAINTAIN/IMPROVE`);
    }
    
    utils.logCalculationStep('income_peer_scoring', neighborhoodMedianIncome, incomePeerScore, 'Neighborhood income-based peer pressure scoring');
    
    // 6. BUSINESS OWNER STATUS (Spending Capacity) (0-20 points)
    let businessOwnerScore = 0;
    const isBusinessOwner = item.json.business_owner === true;
    
    if (isBusinessOwner) {
      businessOwnerScore = 20;
      demographicReasons.push(`Business owner: +20 points - HIGHER SPENDING CAPACITY & PROFESSIONAL IMAGE NEEDS`);
    } else {
      businessOwnerScore = 0;
      demographicReasons.push(`Employee: +0 points - STANDARD SPENDING CAPACITY`);
    }
    
    utils.logCalculationStep('business_owner_scoring', isBusinessOwner, businessOwnerScore, 'Business owner status-based spending capacity scoring');
    
    // Calculate total demographic score with precise rounding
    const rawScore = familyScore + schoolScore + neighborhoodScore + trendScore + incomePeerScore + businessOwnerScore;
    demographicScore = utils.roundScore(rawScore);
    
    utils.logCalculationStep('total_calculation', 
      `Family(${familyScore}) + School(${schoolScore}) + Neighborhood(${neighborhoodScore}) + Trend(${trendScore}) + IncomePeer(${incomePeerScore}) + BusinessOwner(${businessOwnerScore})`, 
      demographicScore, 
      'Final demographic score calculation');
    
    // Build comprehensive reasons
    demographicReasons.push(`=== DEMOGRAPHIC FIT SCORE: ${demographicScore}/100 ===`);
    demographicReasons.push(`Family: ${familyScore} + School: ${schoolScore} + Neighborhood: ${neighborhoodScore} + Trend: ${trendScore} + Income Peer: ${incomePeerScore} + Business Owner: ${businessOwnerScore} = ${demographicScore}`);
    
    // Return the result for this lead
    return {
      json: {
        ...item.json, // Preserve all original data
        
        // Demographic scoring results
        demographic_score: demographicScore,
        demographic_reasons: demographicReasons,
        
        // Detailed breakdown
        demographic_breakdown: {
          family_score: familyScore,
          school_score: schoolScore,
          neighborhood_score: neighborhoodScore,
          trend_score: trendScore,
          income_peer_score: incomePeerScore,
          business_owner_score: businessOwnerScore,
          total_demographic_score: demographicScore
        },
        
        // Calculation log for debugging
        calculation_log: calculationLog,
        
        // Validation metadata
        validation_metadata: {
          deterministic: true,
          rounding_applied: true,
          random_functions_eliminated: true
        }
      }
    };
  });
  
  console.log("=== FIXED DEMOGRAPHIC MODULE END ===");
  console.log("Returning", processedItems.length, "processed leads");
  
  // Return all processed items
  return processedItems;
  
} catch (error) {
  console.error('Error in Fixed Demographic Module:', error);
  
  // Return error for all items
  const allItems = $input.all();
  return allItems.map((item) => ({
    json: {
      ...item.json,
      demographic_score: 0,
      demographic_reasons: [`Error in demographic calculation: ${error.message}`],
      error: error.message
    }
  }));
}
