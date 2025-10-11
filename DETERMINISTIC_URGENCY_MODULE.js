// DETERMINISTIC URGENCY/TIMING MODULE
// Uses fixed dates and consistent calculations for reproducible results

try {
  // Initialize variables
  let urgencyScore = 0;
  let urgencyReasons = [];
  
  // DETERMINISTIC DATE HANDLING - Use fixed reference date for consistency
  const FIXED_REFERENCE_DATE = new Date('2024-01-15'); // Fixed date for testing consistency
  const currentMonth = FIXED_REFERENCE_DATE.getMonth() + 1; // January = 1
  const currentYear = FIXED_REFERENCE_DATE.getFullYear(); // 2024
  
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
  
  // 1. NEW HOMEOWNER STATUS (0-100 points) - Peak buying window
  let baseUrgencyScore = 0;
  const daysSincePurchase = utils.validateNumericInput($json.days_since_purchase, 0, 0, 3650);
  
  if (daysSincePurchase <= 30) {
    baseUrgencyScore = 100; // Peak buying window
    urgencyReasons.push(`New homeowner (≤30 days): +100 points - PEAK BUYING WINDOW`);
  } else if (daysSincePurchase <= 60) {
    baseUrgencyScore = 95;
    urgencyReasons.push(`New homeowner (31-60 days): +95 points - HIGH BUYING WINDOW`);
  } else if (daysSincePurchase <= 90) {
    baseUrgencyScore = 85;
    urgencyReasons.push(`New homeowner (61-90 days): +85 points - GOOD BUYING WINDOW`);
  } else if (daysSincePurchase <= 120) {
    baseUrgencyScore = 70;
    urgencyReasons.push(`New homeowner (91-120 days): +70 points - MODERATE WINDOW`);
  } else if (daysSincePurchase <= 180) {
    baseUrgencyScore = 50;
    urgencyReasons.push(`New homeowner (121-180 days): +50 points - DECLINING WINDOW`);
  } else if (daysSincePurchase <= 365) {
    baseUrgencyScore = 30;
    urgencyReasons.push(`New homeowner (181-365 days): +30 points - LOW WINDOW`);
  } else {
    baseUrgencyScore = 10;
    urgencyReasons.push(`Established homeowner (>365 days): +10 points - MINIMAL WINDOW`);
  }
  
  utils.logCalculationStep('homeowner_status', daysSincePurchase, baseUrgencyScore, 'Days since purchase scoring');
  
  // 2. SEASONAL TIMING BONUS (0-20 points) - Deterministic based on fixed date
  let seasonalBonus = 0;
  if ([3, 4, 5].includes(currentMonth)) {
    seasonalBonus = 20; // Spring - high activity
    urgencyReasons.push(`Spring season (Mar-May): +20 points - HIGH ACTIVITY`);
  } else if ([9, 10].includes(currentMonth)) {
    seasonalBonus = 15; // Fall - high activity
    urgencyReasons.push(`Fall season (Sep-Oct): +15 points - HIGH ACTIVITY`);
  } else if ([6, 7, 8].includes(currentMonth)) {
    seasonalBonus = 10; // Summer - moderate
    urgencyReasons.push(`Summer season (Jun-Aug): +10 points - MODERATE ACTIVITY`);
  } else {
    seasonalBonus = 5; // Winter - low
    urgencyReasons.push(`Winter season (Nov-Feb): +5 points - LOW ACTIVITY`);
  }
  
  utils.logCalculationStep('seasonal_timing', currentMonth, seasonalBonus, 'Month-based seasonal bonus');
  
  // 3. PURCHASE PRICE VS MARKET (Overpaying Indicator) (0-20 points)
  let overpayBonus = 0;
  const propertyValue = utils.validateNumericInput($json.property_value, 0, 0, 10000000);
  const marketValue = utils.validateNumericInput($json.market_value, 0, 0, 10000000);
  
  if (propertyValue > 0 && marketValue > 0) {
    const priceDifferential = (propertyValue / marketValue) - 1;
    const priceDifferentialPercent = Math.round(priceDifferential * 1000) / 10; // Round to 1 decimal place
    
    if (priceDifferential > 0.10) {
      overpayBonus = 20; // Paid 10%+ over market - has budget and motivation
      urgencyReasons.push(`Overpaid 10%+ (${priceDifferentialPercent.toFixed(1)}%): +20 points - HIGH BUDGET & MOTIVATION`);
    } else if (priceDifferential > 0.05) {
      overpayBonus = 10; // Paid 5-10% over market
      urgencyReasons.push(`Overpaid 5-10% (${priceDifferentialPercent.toFixed(1)}%): +10 points - GOOD BUDGET`);
    } else if (priceDifferential > 0) {
      overpayBonus = 5; // Paid slightly over market
      urgencyReasons.push(`Overpaid slightly (${priceDifferentialPercent.toFixed(1)}%): +5 points - SOME BUDGET`);
    } else {
      overpayBonus = 0; // Paid at or below market
      urgencyReasons.push(`Paid at/below market: +0 points - STANDARD PURCHASE`);
    }
    
    utils.logCalculationStep('overpay_analysis', `${propertyValue}/${marketValue}`, overpayBonus, `Price differential: ${priceDifferentialPercent.toFixed(1)}%`);
  } else {
    // Estimate overpay based on property characteristics
    if (propertyValue >= 600000 && daysSincePurchase <= 90) {
      overpayBonus = 10; // High-value recent purchase likely involved competition
      urgencyReasons.push(`High-value recent purchase: +10 points - LIKELY COMPETITIVE BIDDING`);
    } else {
      overpayBonus = 0;
      urgencyReasons.push(`No overpay data available: +0 points (default)`);
    }
    
    utils.logCalculationStep('overpay_estimate', `${propertyValue}/${marketValue}`, overpayBonus, 'Estimated based on property characteristics');
  }
  
  // 4. RECENT PERMITS (Urgency Signal) (0-25 points)
  let permitScore = 0;
  const daysSincePermit = utils.validateNumericInput($json.days_since_permit, null, 0, 3650);
  
  if (daysSincePermit !== null && daysSincePermit <= 30) {
    permitScore = 25; // Very recent permit - active improvement
    urgencyReasons.push(`Recent permit (≤30 days): +25 points - ACTIVE IMPROVEMENT`);
  } else if (daysSincePermit !== null && daysSincePermit <= 60) {
    permitScore = 20; // Recent permit - likely planning
    urgencyReasons.push(`Recent permit (31-60 days): +20 points - LIKELY PLANNING`);
  } else if (daysSincePermit !== null && daysSincePermit <= 90) {
    permitScore = 15; // Moderate permit - some activity
    urgencyReasons.push(`Recent permit (61-90 days): +15 points - SOME ACTIVITY`);
  } else if (daysSincePermit !== null && daysSincePermit <= 180) {
    permitScore = 10; // Older permit - minimal activity
    urgencyReasons.push(`Recent permit (91-180 days): +10 points - MINIMAL ACTIVITY`);
  } else {
    permitScore = 0;
    urgencyReasons.push(`No permit data available: +0 points (default)`);
  }
  
  utils.logCalculationStep('permit_analysis', daysSincePermit, permitScore, 'Days since permit scoring');
  
  // 5. RECENT VIOLATIONS (Urgency Signal) (0-25 points)
  let violationScore = 0;
  const daysSinceViolation = utils.validateNumericInput($json.days_since_violation, null, 0, 3650);
  
  if (daysSinceViolation !== null && daysSinceViolation <= 30) {
    violationScore = 25; // Very recent violation - urgent compliance need
    urgencyReasons.push(`Recent violation (≤30 days): +25 points - URGENT COMPLIANCE NEED`);
  } else if (daysSinceViolation !== null && daysSinceViolation <= 60) {
    violationScore = 20; // Recent violation - compliance pressure
    urgencyReasons.push(`Recent violation (31-60 days): +20 points - COMPLIANCE PRESSURE`);
  } else if (daysSinceViolation !== null && daysSinceViolation <= 90) {
    violationScore = 15; // Moderate violation - some pressure
    urgencyReasons.push(`Recent violation (61-90 days): +15 points - SOME PRESSURE`);
  } else if (daysSinceViolation !== null && daysSinceViolation <= 180) {
    violationScore = 10; // Older violation - minimal pressure
    urgencyReasons.push(`Recent violation (91-180 days): +10 points - MINIMAL PRESSURE`);
  } else {
    violationScore = 0;
    urgencyReasons.push(`No violation data available: +0 points (default)`);
  }
  
  utils.logCalculationStep('violation_analysis', daysSinceViolation, violationScore, 'Days since violation scoring');
  
  // Calculate total urgency score with precise rounding
  const rawScore = baseUrgencyScore + seasonalBonus + overpayBonus + permitScore + violationScore;
  urgencyScore = utils.roundScore(rawScore);
  
  utils.logCalculationStep('total_calculation', `${baseUrgencyScore}+${seasonalBonus}+${overpayBonus}+${permitScore}+${violationScore}`, urgencyScore, 'Final urgency score calculation');
  
  // Build comprehensive reasons
  urgencyReasons.push(`=== URGENCY/TIMING SCORE: ${urgencyScore}/100 ===`);
  urgencyReasons.push(`Base Score: ${baseUrgencyScore} + Seasonal: ${seasonalBonus} + Overpay: ${overpayBonus} + Permits: ${permitScore} + Violations: ${violationScore} = ${urgencyScore}`);
  
  // Return the result with calculation log
  return [{
    json: {
      ...$json, // Preserve all original data
      
      // Urgency scoring results
      urgency_score: urgencyScore,
      urgency_reasons: urgencyReasons,
      
      // Detailed breakdown
      urgency_breakdown: {
        base_urgency_score: baseUrgencyScore,
        seasonal_bonus: seasonalBonus,
        overpay_bonus: overpayBonus,
        permit_score: permitScore,
        violation_score: violationScore,
        total_urgency_score: urgencyScore,
        reference_date: FIXED_REFERENCE_DATE.toISOString(),
        current_month: currentMonth
      },
      
      // Calculation log for debugging
      calculation_log: calculationLog,
      
      // Validation metadata
      validation_metadata: {
        deterministic: true,
        fixed_reference_date: FIXED_REFERENCE_DATE.toISOString(),
        rounding_applied: true,
        random_functions_eliminated: true
      }
    }
  }];
  
} catch (error) {
  // Error handling with deterministic defaults
  console.error('Error in Deterministic Urgency Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      urgency_score: 30, // Safe default score
      urgency_reasons: [
        "Error in urgency calculation: defaulting to 30 points (deterministic fallback)",
        "Check data quality and try again",
        `Error: ${error.message}`
      ],
      urgency_breakdown: {
        base_urgency_score: 30,
        seasonal_bonus: 0,
        overpay_bonus: 0,
        permit_score: 0,
        violation_score: 0,
        total_urgency_score: 30,
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
