// FINAL SCORING & TIER ASSIGNMENT MODULE
// Input: Property data object (with all 5 module scores and service classification)
// Output: final_score, tier, lead_value, final_reasons

try {
  // Initialize variables
  let finalScore = 0;
  let tier = 'Tier 3';
  let leadValue = 50;
  let finalReasons = [];
  
  // Get all module scores
  const urgencyScore = $json.urgency_score || 0;
  const propertyScore = $json.property_score || 0;
  const financialScore = $json.financial_score || 0;
  const demographicScore = $json.demographic_score || 0;
  const marketScore = $json.market_score || 0;
  
  // Get primary service
  const primaryService = $json.primary_service || 'landscaping';
  
  // Define service-specific weights
  const serviceWeights = {
    'landscaping': {
      urgency: 0.30,
      property: 0.25,
      financial: 0.25,
      demographic: 0.15,
      market: 0.05
    },
    'roofing': {
      urgency: 0.40,
      property: 0.30,
      financial: 0.20,
      demographic: 0.05,
      market: 0.05
    },
    'remodeling': {
      urgency: 0.25,
      property: 0.20,
      financial: 0.35,
      demographic: 0.15,
      market: 0.05
    },
    'flooring': {
      urgency: 0.30,
      property: 0.25,
      financial: 0.25,
      demographic: 0.15,
      market: 0.05
    },
    'hvac': {
      urgency: 0.45,
      property: 0.25,
      financial: 0.20,
      demographic: 0.05,
      market: 0.05
    },
    'windows': {
      urgency: 0.35,
      property: 0.30,
      financial: 0.25,
      demographic: 0.05,
      market: 0.05
    }
  };
  
  // Get weights for the primary service
  const weights = serviceWeights[primaryService] || serviceWeights['landscaping'];
  
  // Calculate weighted final score
  finalScore = Math.round(
    (urgencyScore * weights.urgency) +
    (propertyScore * weights.property) +
    (financialScore * weights.financial) +
    (demographicScore * weights.demographic) +
    (marketScore * weights.market)
  );
  
  // Add scoring breakdown to reasons
  finalReasons.push(`Service: ${primaryService}`);
  finalReasons.push(`Urgency Score: ${urgencyScore} × ${(weights.urgency * 100)}% = ${Math.round(urgencyScore * weights.urgency)}`);
  finalReasons.push(`Property Score: ${propertyScore} × ${(weights.property * 100)}% = ${Math.round(propertyScore * weights.property)}`);
  finalReasons.push(`Financial Score: ${financialScore} × ${(weights.financial * 100)}% = ${Math.round(financialScore * weights.financial)}`);
  finalReasons.push(`Demographic Score: ${demographicScore} × ${(weights.demographic * 100)}% = ${Math.round(demographicScore * weights.demographic)}`);
  finalReasons.push(`Market Score: ${marketScore} × ${(weights.market * 100)}% = ${Math.round(marketScore * weights.market)}`);
  finalReasons.push(`Final Score: ${finalScore}/100`);
  
  // Assign tier based on final score
  if (finalScore >= 70) {
    tier = 'Tier 1';
    leadValue = 150 + Math.round((finalScore - 70) * 2); // $150-200 range
    finalReasons.push(`Tier 1 Lead (70+ points): High conversion potential`);
  } else if (finalScore >= 50) {
    tier = 'Tier 2';
    leadValue = 75 + Math.round((finalScore - 50) * 3); // $75-135 range
    finalReasons.push(`Tier 2 Lead (50-69 points): Good conversion potential`);
  } else if (finalScore >= 35) {
    tier = 'Tier 3';
    leadValue = 25 + Math.round((finalScore - 35) * 3); // $25-70 range
    finalReasons.push(`Tier 3 Lead (35-49 points): Moderate conversion potential`);
  } else {
    tier = 'Filtered';
    leadValue = 0;
    finalReasons.push(`Filtered Lead (<35 points): Low conversion potential`);
  }
  
  // Add lead value to reasons
  finalReasons.push(`Estimated Lead Value: $${leadValue}`);
  
  // Generate key factors summary
  const keyFactors = [];
  if (urgencyScore >= 70) keyFactors.push('High Urgency');
  if (propertyScore >= 70) keyFactors.push('Premium Property');
  if (financialScore >= 70) keyFactors.push('High Financial Capacity');
  if (demographicScore >= 70) keyFactors.push('Ideal Demographics');
  if (marketScore >= 70) keyFactors.push('Strong Market');
  
  // Add service-specific factors
  if (primaryService === 'remodeling' && $json.days_since_purchase <= 180) {
    keyFactors.push('New Homeowner');
  }
  if (primaryService === 'landscaping' && $json.has_pool === true) {
    keyFactors.push('Pool Property');
  }
  if (primaryService === 'roofing' && ($json.year_built || 0) <= 2005) {
    keyFactors.push('Aging Roof');
  }
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data
      final_score: finalScore,
      tier: tier,
      lead_value: leadValue,
      final_reasons: finalReasons,
      key_factors: keyFactors,
      scoring_breakdown: {
        urgency_weighted: Math.round(urgencyScore * weights.urgency),
        property_weighted: Math.round(propertyScore * weights.property),
        financial_weighted: Math.round(financialScore * weights.financial),
        demographic_weighted: Math.round(demographicScore * weights.demographic),
        market_weighted: Math.round(marketScore * weights.market),
        final_score: finalScore,
        service_weights: weights
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Final Scoring:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      final_score: 50, // Safe default score
      tier: 'Tier 3',
      lead_value: 75,
      final_reasons: [
        "Error in final scoring: defaulting to Tier 3",
        "Check data quality and try again"
      ],
      key_factors: ['Error in calculation'],
      scoring_breakdown: {
        urgency_weighted: 0,
        property_weighted: 0,
        financial_weighted: 0,
        demographic_weighted: 0,
        market_weighted: 0,
        final_score: 50,
        service_weights: serviceWeights['landscaping']
      },
      error: error.message
    }
  }];
}



