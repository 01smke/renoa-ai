// DETERMINISTIC SERVICE CLASSIFICATION MODULE
// Analyzes property characteristics to determine which services are needed
// Uses consistent logic for reproducible results

try {
  // Initialize variables
  let primaryService = 'landscaping'; // Default fallback
  let allServices = [];
  let serviceReasons = [];
  
  // Initialize calculation log
  const calculationLog = [];
  
  // Utility functions for consistent calculations
  const utils = {
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
  
  // Get property data with validation
  const propertyValue = utils.validateNumericInput($json.property_value, 0, 0, 10000000);
  const yearBuilt = utils.validateNumericInput($json.year_built, 2000, 1800, 2024);
  const propertyAge = 2024 - yearBuilt;
  const lotSizeAcres = parseFloat($json.lot_size_acres) || 0;
  const lotSizeSqft = lotSizeAcres * 43560; // Convert acres to sqft
  const buildingSqft = utils.validateNumericInput($json.building_sqft, 0, 0, 50000);
  const daysSincePurchase = utils.validateNumericInput($json.days_since_purchase, 365, 0, 3650);
  const hasPool = $json.has_pool === true;
  const hasHoa = $json.has_hoa === true;
  const propertyType = $json.property_type || 'Single Family';
  
  // Service scoring system (0-100 points per service)
  const serviceScores = {
    landscaping: 0,
    roofing: 0,
    remodeling: 0,
    flooring: 0,
    hvac: 0,
    windows: 0
  };
  
  // 1. LANDSCAPING SERVICE DETECTION
  // Indicators: Large lots, pools, HOA properties
  let landscapingScore = 0;
  
  // Lot size scoring (0-40 points)
  if (lotSizeAcres >= 0.5) {
    landscapingScore += 40;
    serviceReasons.push(`Large lot (${lotSizeAcres.toFixed(2)} acres): +40 points for landscaping`);
  } else if (lotSizeAcres >= 0.25) {
    landscapingScore += 30;
    serviceReasons.push(`Good lot size (${lotSizeAcres.toFixed(2)} acres): +30 points for landscaping`);
  } else if (lotSizeAcres >= 0.15) {
    landscapingScore += 20;
    serviceReasons.push(`Moderate lot size (${lotSizeAcres.toFixed(2)} acres): +20 points for landscaping`);
  } else if (lotSizeAcres >= 0.1) {
    landscapingScore += 10;
    serviceReasons.push(`Small lot (${lotSizeAcres.toFixed(2)} acres): +10 points for landscaping`);
  }
  
  // Pool bonus (0-30 points)
  if (hasPool) {
    landscapingScore += 30;
    serviceReasons.push(`Has pool: +30 points for landscaping`);
  }
  
  // HOA bonus (0-20 points)
  if (hasHoa) {
    landscapingScore += 20;
    serviceReasons.push(`HOA property: +20 points for landscaping`);
  }
  
  // Property type bonus (0-10 points)
  if (propertyType.toLowerCase().includes('single family')) {
    landscapingScore += 10;
    serviceReasons.push(`Single family home: +10 points for landscaping`);
  }
  
  serviceScores.landscaping = landscapingScore;
  utils.logCalculationStep('landscaping_scoring', `${lotSizeAcres}acres, Pool:${hasPool}, HOA:${hasHoa}`, landscapingScore);
  
  // 2. ROOFING SERVICE DETECTION
  // Indicators: Age 15+ years, recent storms, roof permits
  let roofingScore = 0;
  
  // Property age scoring (0-60 points)
  if (propertyAge >= 25) {
    roofingScore += 60;
    serviceReasons.push(`Very old property (${propertyAge} years): +60 points for roofing`);
  } else if (propertyAge >= 20) {
    roofingScore += 50;
    serviceReasons.push(`Old property (${propertyAge} years): +50 points for roofing`);
  } else if (propertyAge >= 15) {
    roofingScore += 40;
    serviceReasons.push(`Moderate age property (${propertyAge} years): +40 points for roofing`);
  } else if (propertyAge >= 10) {
    roofingScore += 20;
    serviceReasons.push(`Property age ${propertyAge} years: +20 points for roofing`);
  }
  
  // Recent purchase bonus (0-30 points)
  if (daysSincePurchase <= 180) {
    roofingScore += 30;
    serviceReasons.push(`Recent purchase (${daysSincePurchase} days): +30 points for roofing`);
  } else if (daysSincePurchase <= 365) {
    roofingScore += 20;
    serviceReasons.push(`Recent purchase (${daysSincePurchase} days): +20 points for roofing`);
  }
  
  // Property value bonus (0-10 points)
  if (propertyValue >= 500000) {
    roofingScore += 10;
    serviceReasons.push(`High-value property: +10 points for roofing`);
  }
  
  serviceScores.roofing = roofingScore;
  utils.logCalculationStep('roofing_scoring', `${propertyAge}years, ${daysSincePurchase}days`, roofingScore);
  
  // 3. REMODELING SERVICE DETECTION
  // Indicators: New homeowners, high value properties
  let remodelingScore = 0;
  
  // New homeowner scoring (0-50 points)
  if (daysSincePurchase <= 90) {
    remodelingScore += 50;
    serviceReasons.push(`New homeowner (${daysSincePurchase} days): +50 points for remodeling`);
  } else if (daysSincePurchase <= 180) {
    remodelingScore += 40;
    serviceReasons.push(`Recent homeowner (${daysSincePurchase} days): +40 points for remodeling`);
  } else if (daysSincePurchase <= 365) {
    remodelingScore += 25;
    serviceReasons.push(`Moderate homeowner (${daysSincePurchase} days): +25 points for remodeling`);
  }
  
  // Property value scoring (0-40 points)
  if (propertyValue >= 600000) {
    remodelingScore += 40;
    serviceReasons.push(`High-value property ($${propertyValue.toLocaleString()}): +40 points for remodeling`);
  } else if (propertyValue >= 400000) {
    remodelingScore += 30;
    serviceReasons.push(`Good-value property ($${propertyValue.toLocaleString()}): +30 points for remodeling`);
  } else if (propertyValue >= 300000) {
    remodelingScore += 20;
    serviceReasons.push(`Moderate-value property ($${propertyValue.toLocaleString()}): +20 points for remodeling`);
  }
  
  // Property size bonus (0-10 points)
  if (buildingSqft >= 3000) {
    remodelingScore += 10;
    serviceReasons.push(`Large building (${buildingSqft.toLocaleString()} sqft): +10 points for remodeling`);
  }
  
  serviceScores.remodeling = remodelingScore;
  utils.logCalculationStep('remodeling_scoring', `${daysSincePurchase}days, $${propertyValue}`, remodelingScore);
  
  // 4. FLOORING SERVICE DETECTION
  // Indicators: Age 15+ years, recent purchases
  let flooringScore = 0;
  
  // Property age scoring (0-50 points)
  if (propertyAge >= 20) {
    flooringScore += 50;
    serviceReasons.push(`Old property (${propertyAge} years): +50 points for flooring`);
  } else if (propertyAge >= 15) {
    flooringScore += 40;
    serviceReasons.push(`Moderate age property (${propertyAge} years): +40 points for flooring`);
  } else if (propertyAge >= 10) {
    flooringScore += 25;
    serviceReasons.push(`Property age ${propertyAge} years: +25 points for flooring`);
  }
  
  // Recent purchase bonus (0-30 points)
  if (daysSincePurchase <= 180) {
    flooringScore += 30;
    serviceReasons.push(`Recent purchase (${daysSincePurchase} days): +30 points for flooring`);
  } else if (daysSincePurchase <= 365) {
    flooringScore += 20;
    serviceReasons.push(`Recent purchase (${daysSincePurchase} days): +20 points for flooring`);
  }
  
  // Property value bonus (0-20 points)
  if (propertyValue >= 400000) {
    flooringScore += 20;
    serviceReasons.push(`Good-value property: +20 points for flooring`);
  } else if (propertyValue >= 250000) {
    flooringScore += 10;
    serviceReasons.push(`Moderate-value property: +10 points for flooring`);
  }
  
  serviceScores.flooring = flooringScore;
  utils.logCalculationStep('flooring_scoring', `${propertyAge}years, ${daysSincePurchase}days`, flooringScore);
  
  // 5. HVAC SERVICE DETECTION
  // Indicators: Age 15+ years, seasonal timing
  let hvacScore = 0;
  
  // Property age scoring (0-60 points)
  if (propertyAge >= 20) {
    hvacScore += 60;
    serviceReasons.push(`Old property (${propertyAge} years): +60 points for HVAC`);
  } else if (propertyAge >= 15) {
    hvacScore += 50;
    serviceReasons.push(`Moderate age property (${propertyAge} years): +50 points for HVAC`);
  } else if (propertyAge >= 10) {
    hvacScore += 30;
    serviceReasons.push(`Property age ${propertyAge} years: +30 points for HVAC`);
  }
  
  // Recent purchase bonus (0-25 points)
  if (daysSincePurchase <= 180) {
    hvacScore += 25;
    serviceReasons.push(`Recent purchase (${daysSincePurchase} days): +25 points for HVAC`);
  } else if (daysSincePurchase <= 365) {
    hvacScore += 15;
    serviceReasons.push(`Recent purchase (${daysSincePurchase} days): +15 points for HVAC`);
  }
  
  // Property size bonus (0-15 points)
  if (buildingSqft >= 3000) {
    hvacScore += 15;
    serviceReasons.push(`Large building: +15 points for HVAC`);
  } else if (buildingSqft >= 2000) {
    hvacScore += 10;
    serviceReasons.push(`Good-sized building: +10 points for HVAC`);
  }
  
  serviceScores.hvac = hvacScore;
  utils.logCalculationStep('hvac_scoring', `${propertyAge}years, ${buildingSqft}sqft`, hvacScore);
  
  // 6. WINDOWS/DOORS SERVICE DETECTION
  // Indicators: Age 20+ years, energy efficiency needs
  let windowsScore = 0;
  
  // Property age scoring (0-70 points)
  if (propertyAge >= 25) {
    windowsScore += 70;
    serviceReasons.push(`Very old property (${propertyAge} years): +70 points for windows`);
  } else if (propertyAge >= 20) {
    windowsScore += 60;
    serviceReasons.push(`Old property (${propertyAge} years): +60 points for windows`);
  } else if (propertyAge >= 15) {
    windowsScore += 40;
    serviceReasons.push(`Moderate age property (${propertyAge} years): +40 points for windows`);
  }
  
  // Property value bonus (0-20 points)
  if (propertyValue >= 500000) {
    windowsScore += 20;
    serviceReasons.push(`High-value property: +20 points for windows`);
  } else if (propertyValue >= 350000) {
    windowsScore += 10;
    serviceReasons.push(`Good-value property: +10 points for windows`);
  }
  
  // Recent purchase bonus (0-10 points)
  if (daysSincePurchase <= 365) {
    windowsScore += 10;
    serviceReasons.push(`Recent purchase: +10 points for windows`);
  }
  
  serviceScores.windows = windowsScore;
  utils.logCalculationStep('windows_scoring', `${propertyAge}years, $${propertyValue}`, windowsScore);
  
  // Determine primary service (highest scoring service)
  let maxScore = 0;
  for (const [service, score] of Object.entries(serviceScores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryService = service;
    }
  }
  
  // Determine all qualifying services (score >= 30)
  allServices = Object.entries(serviceScores)
    .filter(([service, score]) => score >= 30)
    .map(([service, score]) => service)
    .sort((a, b) => serviceScores[b] - serviceScores[a]);
  
  // If no services qualify, use primary service as fallback
  if (allServices.length === 0) {
    allServices = [primaryService];
    serviceReasons.push(`No services scored 30+ points, using primary service: ${primaryService}`);
  }
  
  // Log service determination
  utils.logCalculationStep('service_determination', `${Object.entries(serviceScores).map(([s, score]) => `${s}:${score}`).join(', ')}`, primaryService, `All services: ${allServices.join(', ')}`);
  
  // Build summary
  serviceReasons.push(`=== SERVICE CLASSIFICATION RESULTS ===`);
  serviceReasons.push(`Primary Service: ${primaryService} (${serviceScores[primaryService]} points)`);
  serviceReasons.push(`All Services: ${allServices.join(', ')}`);
  serviceReasons.push(`Service Scores: ${Object.entries(serviceScores).map(([s, score]) => `${s}: ${score}`).join(', ')}`);
  
  // Return the result with calculation log
  return [{
    json: {
      ...$json, // Preserve all original data
      
      // Service classification results
      primary_service: primaryService,
      all_services: allServices,
      service_scores: serviceScores,
      service_reasons: serviceReasons,
      
      // Detailed breakdown
      service_breakdown: {
        landscaping_score: serviceScores.landscaping,
        roofing_score: serviceScores.roofing,
        remodeling_score: serviceScores.remodeling,
        flooring_score: serviceScores.flooring,
        hvac_score: serviceScores.hvac,
        windows_score: serviceScores.windows,
        primary_service: primaryService,
        qualifying_services: allServices,
        max_score: maxScore
      },
      
      // Calculation log for debugging
      calculation_log: calculationLog,
      
      // Validation metadata
      validation_metadata: {
        deterministic: true,
        property_data_validated: true,
        scoring_logic_consistent: true
      }
    }
  }];
  
} catch (error) {
  // Error handling with deterministic defaults
  console.error('Error in Deterministic Service Classification:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      primary_service: 'landscaping', // Safe default
      all_services: ['landscaping'],
      service_scores: {
        landscaping: 30,
        roofing: 0,
        remodeling: 0,
        flooring: 0,
        hvac: 0,
        windows: 0
      },
      service_reasons: [
        "Error in service classification: defaulting to landscaping (deterministic fallback)",
        "Check data quality and try again",
        `Error: ${error.message}`
      ],
      service_breakdown: {
        landscaping_score: 30,
        roofing_score: 0,
        remodeling_score: 0,
        flooring_score: 0,
        hvac_score: 0,
        windows_score: 0,
        primary_service: 'landscaping',
        qualifying_services: ['landscaping'],
        max_score: 30,
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
