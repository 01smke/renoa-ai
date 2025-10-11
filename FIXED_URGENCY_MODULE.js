// FIXED URGENCY MODULE - Processes ALL items, not just the first one
// This works with "Run Once for All Items" mode

try {
  console.log("=== FIXED URGENCY MODULE START ===");
  
  // Get all input items
  const allItems = $input.all();
  console.log("Processing", allItems.length, "leads for urgency scoring");
  
  // Process each item
  const processedItems = allItems.map((item, index) => {
    console.log(`Processing lead ${index + 1}: ${item.json.contact_name}`);
    
    // Initialize variables for this lead
    let urgencyScore = 0;
    let urgencyReasons = [];
    
    // DETERMINISTIC DATE HANDLING - Use fixed reference date for consistency
    const FIXED_REFERENCE_DATE = new Date('2024-01-15');
    const currentMonth = FIXED_REFERENCE_DATE.getMonth() + 1;
    const currentYear = FIXED_REFERENCE_DATE.getFullYear();
    
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
    
    // 1. NEW HOMEOWNER STATUS (0-100 points)
    let baseUrgencyScore = 0;
    const daysSincePurchase = utils.validateNumericInput(item.json.days_since_purchase, 0, 0, 3650);
    
    if (daysSincePurchase <= 30) {
      baseUrgencyScore = 100;
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
    
    // 2. SEASONAL TIMING BONUS (0-20 points) - Fixed for January
    let seasonalBonus = 5; // January = 5 points
    urgencyReasons.push(`Winter season (Nov-Feb): +5 points - LOW ACTIVITY`);
    
    utils.logCalculationStep('seasonal_timing', currentMonth, seasonalBonus, 'Month-based seasonal bonus');
    
    // 3. SIMPLIFIED OVERPAY BONUS (0-20 points)
    let overpayBonus = 0;
    const propertyValue = utils.validateNumericInput(item.json.property_value, 0, 0, 10000000);
    
    // Simple overpay estimate based on property value and recent purchase
    if (propertyValue >= 600000 && daysSincePurchase <= 90) {
      overpayBonus = 10;
      urgencyReasons.push(`High-value recent purchase: +10 points - LIKELY COMPETITIVE BIDDING`);
    } else {
      overpayBonus = 0;
      urgencyReasons.push(`No overpay data available: +0 points (default)`);
    }
    
    utils.logCalculationStep('overpay_estimate', `${propertyValue}/${daysSincePurchase}`, overpayBonus, 'Estimated based on property value and purchase timing');
    
    // Calculate total urgency score
    const rawScore = baseUrgencyScore + seasonalBonus + overpayBonus;
    urgencyScore = utils.roundScore(rawScore);
    
    utils.logCalculationStep('total_calculation', 
      `${baseUrgencyScore}+${seasonalBonus}+${overpayBonus}`, 
      urgencyScore, 
      'Final urgency score calculation');
    
    // Build comprehensive reasons
    urgencyReasons.push(`=== URGENCY/TIMING SCORE: ${urgencyScore}/100 ===`);
    urgencyReasons.push(`Base Score: ${baseUrgencyScore} + Seasonal: ${seasonalBonus} + Overpay: ${overpayBonus} = ${urgencyScore}`);
    
    // Return the result for this lead
    return {
      json: {
        ...item.json, // Preserve all original data
        
        // Urgency scoring results
        urgency_score: urgencyScore,
        urgency_reasons: urgencyReasons,
        
        // Detailed breakdown
        urgency_breakdown: {
          base_urgency_score: baseUrgencyScore,
          seasonal_bonus: seasonalBonus,
          overpay_bonus: overpayBonus,
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
    };
  });
  
  console.log("=== FIXED URGENCY MODULE END ===");
  console.log("Returning", processedItems.length, "processed leads");
  
  // Return all processed items
  return processedItems;
  
} catch (error) {
  console.error('Error in Fixed Urgency Module:', error);
  
  // Return error for all items
  const allItems = $input.all();
  return allItems.map((item) => ({
    json: {
      ...item.json,
      urgency_score: 0,
      urgency_reasons: [`Error in urgency calculation: ${error.message}`],
      error: error.message
    }
  }));
}
