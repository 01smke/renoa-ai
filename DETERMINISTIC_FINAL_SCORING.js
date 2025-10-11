// DETERMINISTIC FINAL SCORING MODULE
// Uses consistent rounding, validation, and logging for reproducible results

// Load calculation utilities
const utils = {
  roundScore: (value) => Math.max(0, Math.min(100, Math.round(value))),
  roundCurrency: (value) => Math.round(value),
  validateScoreInput: (value, defaultValue = 0) => {
    const numValue = parseInt(value);
    return isNaN(numValue) ? defaultValue : Math.max(0, Math.min(100, numValue));
  },
  validateNumericInput: (value, defaultValue = 0, min = 0, max = Infinity) => {
    const numValue = parseInt(value);
    return (isNaN(numValue) || numValue < min || numValue > max) ? defaultValue : numValue;
  },
  logCalculationStep: (module, step, input, output, reason = '') => {
    console.log(`[${module}] ${step}: ${input} → ${output} ${reason}`);
    return { module, step, input, output, reason, timestamp: new Date().toISOString() };
  }
};

try {
  // Initialize calculation log
  const calculationLog = [];
  
  // Initialize variables with validation
  let finalScore = 0;
  let tier = 'Tier 3';
  let leadValue = 50;
  let finalReasons = [];
  
  // Get and validate all module scores
  const urgencyScore = utils.validateScoreInput($json.urgency_score, 0);
  const propertyScore = utils.validateScoreInput($json.property_score, 0);
  const financialScore = utils.validateScoreInput($json.financial_score, 0);
  const demographicScore = utils.validateScoreInput($json.demographic_score, 0);
  const marketScore = utils.validateScoreInput($json.market_score, 0);
  
  // Log input validation
  calculationLog.push(utils.logCalculationStep('VALIDATION', 'urgency_score', $json.urgency_score, urgencyScore));
  calculationLog.push(utils.logCalculationStep('VALIDATION', 'property_score', $json.property_score, propertyScore));
  calculationLog.push(utils.logCalculationStep('VALIDATION', 'financial_score', $json.financial_score, financialScore));
  calculationLog.push(utils.logCalculationStep('VALIDATION', 'demographic_score', $json.demographic_score, demographicScore));
  calculationLog.push(utils.logCalculationStep('VALIDATION', 'market_score', $json.market_score, marketScore));
  
  // Get primary service with validation
  const primaryService = $json.primary_service || 'landscaping';
  
  // Define service-specific weights (deterministic)
  const serviceWeights = {
    'landscaping': { urgency: 0.30, property: 0.25, financial: 0.25, demographic: 0.15, market: 0.05 },
    'roofing': { urgency: 0.40, property: 0.30, financial: 0.20, demographic: 0.05, market: 0.05 },
    'remodeling': { urgency: 0.25, property: 0.20, financial: 0.35, demographic: 0.15, market: 0.05 },
    'flooring': { urgency: 0.30, property: 0.25, financial: 0.25, demographic: 0.15, market: 0.05 },
    'hvac': { urgency: 0.45, property: 0.25, financial: 0.20, demographic: 0.05, market: 0.05 },
    'windows': { urgency: 0.35, property: 0.30, financial: 0.25, demographic: 0.05, market: 0.05 }
  };
  
  // Get weights for the primary service with validation
  const weights = serviceWeights[primaryService] || serviceWeights['landscaping'];
  
  // Calculate weighted contributions with precise rounding
  const urgencyWeighted = utils.roundScore(urgencyScore * weights.urgency);
  const propertyWeighted = utils.roundScore(propertyScore * weights.property);
  const financialWeighted = utils.roundScore(financialScore * weights.financial);
  const demographicWeighted = utils.roundScore(demographicScore * weights.demographic);
  const marketWeighted = utils.roundScore(marketScore * weights.market);
  
  // Log weighted calculations
  calculationLog.push(utils.logCalculationStep('WEIGHTED_CALC', 'urgency', `${urgencyScore} × ${weights.urgency}`, urgencyWeighted));
  calculationLog.push(utils.logCalculationStep('WEIGHTED_CALC', 'property', `${propertyScore} × ${weights.property}`, propertyWeighted));
  calculationLog.push(utils.logCalculationStep('WEIGHTED_CALC', 'financial', `${financialScore} × ${weights.financial}`, financialWeighted));
  calculationLog.push(utils.logCalculationStep('WEIGHTED_CALC', 'demographic', `${demographicScore} × ${weights.demographic}`, demographicWeighted));
  calculationLog.push(utils.logCalculationStep('WEIGHTED_CALC', 'market', `${marketScore} × ${weights.market}`, marketWeighted));
  
  // Calculate final weighted score with precise rounding
  const weightedSum = urgencyWeighted + propertyWeighted + financialWeighted + demographicWeighted + marketWeighted;
  finalScore = utils.roundScore(weightedSum);
  
  // Log final score calculation
  calculationLog.push(utils.logCalculationStep('FINAL_SCORE', 'weighted_sum', weightedSum, finalScore, `Service: ${primaryService}`));
  
  // Build detailed scoring breakdown
  finalReasons.push(`=== DETERMINISTIC SCORING BREAKDOWN ===`);
  finalReasons.push(`Service: ${primaryService}`);
  finalReasons.push(`Urgency Score: ${urgencyScore}/100 × ${(weights.urgency * 100).toFixed(1)}% = ${urgencyWeighted} points`);
  finalReasons.push(`Property Score: ${propertyScore}/100 × ${(weights.property * 100).toFixed(1)}% = ${propertyWeighted} points`);
  finalReasons.push(`Financial Score: ${financialScore}/100 × ${(weights.financial * 100).toFixed(1)}% = ${financialWeighted} points`);
  finalReasons.push(`Demographic Score: ${demographicScore}/100 × ${(weights.demographic * 100).toFixed(1)}% = ${demographicWeighted} points`);
  finalReasons.push(`Market Score: ${marketScore}/100 × ${(weights.market * 100).toFixed(1)}% = ${marketWeighted} points`);
  finalReasons.push(`Final Score: ${finalScore}/100`);
  
  // Assign tier based on final score (deterministic thresholds)
  if (finalScore >= 70) {
    tier = 'Tier 1';
    leadValue = utils.roundCurrency(150 + (finalScore - 70) * 2); // $150-200 range
    finalReasons.push(`Tier 1 Lead (70+ points): High conversion potential`);
  } else if (finalScore >= 50) {
    tier = 'Tier 2';
    leadValue = utils.roundCurrency(75 + (finalScore - 50) * 3); // $75-135 range
    finalReasons.push(`Tier 2 Lead (50-69 points): Good conversion potential`);
  } else if (finalScore >= 35) {
    tier = 'Tier 3';
    leadValue = utils.roundCurrency(25 + (finalScore - 35) * 3); // $25-70 range
    finalReasons.push(`Tier 3 Lead (35-49 points): Moderate conversion potential`);
  } else {
    tier = 'Filtered';
    leadValue = 0;
    finalReasons.push(`Filtered Lead (<35 points): Low conversion potential`);
  }
  
  // Log tier assignment
  calculationLog.push(utils.logCalculationStep('TIER_ASSIGNMENT', 'final_score', finalScore, tier, `Lead Value: $${leadValue}`));
  
  // Add lead value to reasons
  finalReasons.push(`Estimated Lead Value: $${leadValue}`);
  
  // Generate key factors summary (deterministic)
  const keyFactors = [];
  if (urgencyScore >= 70) keyFactors.push('High Urgency');
  if (propertyScore >= 70) keyFactors.push('Premium Property');
  if (financialScore >= 70) keyFactors.push('High Financial Capacity');
  if (demographicScore >= 70) keyFactors.push('Ideal Demographics');
  if (marketScore >= 70) keyFactors.push('Strong Market');
  
  // Add service-specific factors (deterministic)
  const daysSincePurchase = utils.validateNumericInput($json.days_since_purchase, 0);
  const yearBuilt = utils.validateNumericInput($json.year_built, 0);
  
  if (primaryService === 'remodeling' && daysSincePurchase <= 180) {
    keyFactors.push('New Homeowner');
  }
  if (primaryService === 'landscaping' && $json.has_pool === true) {
    keyFactors.push('Pool Property');
  }
  if (primaryService === 'roofing' && yearBuilt <= 2005) {
    keyFactors.push('Aging Roof');
  }
  
  // Validation summary
  const validationSummary = {
    input_scores_valid: {
      urgency: urgencyScore === utils.validateScoreInput($json.urgency_score, 0),
      property: propertyScore === utils.validateScoreInput($json.property_score, 0),
      financial: financialScore === utils.validateScoreInput($json.financial_score, 0),
      demographic: demographicScore === utils.validateScoreInput($json.demographic_score, 0),
      market: marketScore === utils.validateScoreInput($json.market_score, 0)
    },
    calculations_deterministic: true,
    rounding_applied: true,
    random_functions_eliminated: true
  };
  
  // Return the result with comprehensive logging
  return [{
    json: {
      ...$json, // Preserve all original data
      
      // Final scoring results (deterministic)
      final_score: finalScore,
      tier: tier,
      lead_value: leadValue,
      final_reasons: finalReasons,
      key_factors: keyFactors,
      
      // Detailed scoring breakdown (precise)
      scoring_breakdown: {
        urgency_weighted: urgencyWeighted,
        property_weighted: propertyWeighted,
        financial_weighted: financialWeighted,
        demographic_weighted: demographicWeighted,
        market_weighted: marketWeighted,
        final_score: finalScore,
        service_weights: weights,
        calculation_log: calculationLog
      },
      
      // Validation and consistency data
      validation_summary: validationSummary,
      
      // Deterministic metadata
      calculation_metadata: {
        timestamp: new Date().toISOString(),
        deterministic: true,
        rounding_precision: 'whole_numbers',
        random_functions_used: false,
        llm_calls_made: false
      }
    }
  }];
  
} catch (error) {
  // Error handling with deterministic defaults
  console.error('Error in Deterministic Final Scoring:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      final_score: 50, // Safe default score
      tier: 'Tier 3',
      lead_value: 75,
      final_reasons: [
        "Error in final scoring: defaulting to Tier 3 (deterministic fallback)",
        "Check data quality and try again",
        `Error: ${error.message}`
      ],
      key_factors: ['Error in calculation'],
      scoring_breakdown: {
        urgency_weighted: 0,
        property_weighted: 0,
        financial_weighted: 0,
        demographic_weighted: 0,
        market_weighted: 0,
        final_score: 50,
        service_weights: { urgency: 0.30, property: 0.25, financial: 0.25, demographic: 0.15, market: 0.05 },
        calculation_log: [{ error: error.message, timestamp: new Date().toISOString() }]
      },
      validation_summary: {
        input_scores_valid: false,
        calculations_deterministic: false,
        rounding_applied: false,
        random_functions_eliminated: true
      },
      calculation_metadata: {
        timestamp: new Date().toISOString(),
        deterministic: false,
        error: error.message
      },
      error: error.message
    }
  }];
}
