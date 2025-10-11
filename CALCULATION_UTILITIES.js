// CALCULATION UTILITIES - DETERMINISTIC SCORING FUNCTIONS
// Provides consistent rounding, validation, and logging for all calculations

// PRECISION AND ROUNDING CONSTANTS
const PRECISION = {
  PERCENTAGE: 1,      // 1 decimal place for percentages
  SCORE: 0,          // Whole numbers for scores
  CURRENCY: 0,       // Whole numbers for currency
  RATIO: 2           // 2 decimal places for ratios
};

// DETERMINISTIC ID GENERATION (replaces Math.random())
function generateDeterministicId(propertyId, timestamp) {
  // Use property ID and fixed timestamp for consistent ID generation
  const baseString = `${propertyId}_${timestamp || 'default'}`;
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `LEAD-${Math.abs(hash).toString(36).substring(0, 8).toUpperCase()}`;
}

// CONSISTENT ROUNDING FUNCTIONS
function roundToPrecision(value, precision = PRECISION.SCORE) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
}

function roundScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function roundPercentage(value) {
  return roundToPrecision(value, PRECISION.PERCENTAGE);
}

function roundCurrency(value) {
  return Math.round(value);
}

// VALIDATION FUNCTIONS
function validateNumericInput(value, defaultValue = 0, min = 0, max = Infinity) {
  const numValue = parseInt(value);
  if (isNaN(numValue) || numValue < min || numValue > max) {
    return defaultValue;
  }
  return numValue;
}

function validatePercentageInput(value, defaultValue = 0) {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0 || numValue > 100) {
    return defaultValue;
  }
  return roundPercentage(numValue);
}

function validateScoreInput(value, defaultValue = 0) {
  return Math.max(0, Math.min(100, validateNumericInput(value, defaultValue, 0, 100)));
}

// LOGGING UTILITIES
function logCalculationStep(moduleName, stepName, inputValue, outputValue, reason = '') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    module: moduleName,
    step: stepName,
    input: inputValue,
    output: outputValue,
    reason: reason
  };
  
  // Store in global calculation log for debugging
  if (typeof global !== 'undefined' && global.calculationLog) {
    global.calculationLog.push(logEntry);
  }
  
  return logEntry;
}

// DETERMINISTIC DATE CALCULATIONS
function getDeterministicDate(propertyDate, currentDate = null) {
  // Use fixed date for testing consistency, or provided current date
  const baseDate = currentDate || new Date('2024-01-15'); // Fixed reference date
  const propDate = new Date(propertyDate);
  
  if (isNaN(propDate.getTime())) {
    return baseDate;
  }
  
  return propDate;
}

function calculateDaysSince(daysSince, defaultValue = 0) {
  return validateNumericInput(daysSince, defaultValue, 0, 3650); // Max 10 years
}

// SCORE BOUNDARY FUNCTIONS
function applyScoreBounds(score, min = 0, max = 100) {
  return Math.max(min, Math.min(max, roundScore(score)));
}

function calculateWeightedScore(scores, weights) {
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(key => {
    const score = validateScoreInput(scores[key], 0);
    const weight = validateNumericInput(weights[key], 0, 0, 1);
    totalScore += score * weight;
    totalWeight += weight;
  });
  
  if (totalWeight === 0) {
    return 0;
  }
  
  return roundScore(totalScore / totalWeight);
}

// TIER ASSIGNMENT FUNCTIONS
function assignTier(finalScore) {
  const score = roundScore(finalScore);
  
  if (score >= 85) return { tier: 'HOT', description: 'ULTRA-HIGH SPENDING LIKELIHOOD' };
  if (score >= 75) return { tier: 'WARM', description: 'HIGH SPENDING LIKELIHOOD' };
  if (score >= 60) return { tier: 'COOL', description: 'MODERATE SPENDING LIKELIHOOD' };
  if (score >= 40) return { tier: 'COLD', description: 'LOW SPENDING LIKELIHOOD' };
  return { tier: 'FROZEN', description: 'MINIMAL SPENDING LIKELIHOOD' };
}

function calculateLeadValue(finalScore) {
  const score = roundScore(finalScore);
  
  if (score >= 85) return roundCurrency(150 + (score - 85) * 3); // $150-195 range
  if (score >= 75) return roundCurrency(100 + (score - 75) * 2.5); // $100-125 range
  if (score >= 60) return roundCurrency(50 + (score - 60) * 2); // $50-80 range
  if (score >= 40) return roundCurrency(25 + (score - 40) * 1.25); // $25-50 range
  return 0;
}

// EXPORT UTILITIES (for Node.js modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateDeterministicId,
    roundToPrecision,
    roundScore,
    roundPercentage,
    roundCurrency,
    validateNumericInput,
    validatePercentageInput,
    validateScoreInput,
    logCalculationStep,
    getDeterministicDate,
    calculateDaysSince,
    applyScoreBounds,
    calculateWeightedScore,
    assignTier,
    calculateLeadValue,
    PRECISION
  };
}
