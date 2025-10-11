// UNIVERSAL FINAL SCORING MODULE - HOT LEAD FINDER
// Combines all 5 enhanced modules with universal weights (no service classification)
// Output: Universal spending likelihood score + tier assignment + comprehensive breakdown

try {
  // Initialize variables
  let finalScore = 0;
  let tier = '';
  let tierDescription = '';
  let finalReasons = [];
  
  // Get individual module scores
  const urgencyScore = $json.urgency_score || 0;
  const propertyScore = $json.property_score || 0;
  const financialScore = $json.financial_score || 0;
  const demographicScore = $json.demographic_score || 0;
  const marketScore = $json.market_score || 0;
  
  // UNIVERSAL WEIGHTS (Optimized for general spending likelihood)
  const weights = {
    urgency: 0.25,      // 25% - Timing is crucial for new homeowners
    property: 0.20,     // 20% - Property characteristics drive renovation needs
    financial: 0.25,    // 25% - Financial capacity determines spending ability
    demographic: 0.20,  // 20% - Demographics predict spending behavior
    market: 0.10        // 10% - Market conditions affect opportunity
  };
  
  // Calculate weighted final score
  const weightedScore = (
    (urgencyScore * weights.urgency) +
    (propertyScore * weights.property) +
    (financialScore * weights.financial) +
    (demographicScore * weights.demographic) +
    (marketScore * weights.market)
  );
  
  // Round to whole number
  finalScore = Math.round(weightedScore);
  
  // Ensure bounds
  finalScore = Math.min(finalScore, 100);
  finalScore = Math.max(finalScore, 0);
  
  // TIER ASSIGNMENT (Universal spending likelihood tiers)
  if (finalScore >= 85) {
    tier = 'HOT';
    tierDescription = 'ULTRA-HIGH SPENDING LIKELIHOOD - IMMEDIATE PRIORITY';
  } else if (finalScore >= 75) {
    tier = 'WARM';
    tierDescription = 'HIGH SPENDING LIKELIHOOD - HIGH PRIORITY';
  } else if (finalScore >= 60) {
    tier = 'COOL';
    tierDescription = 'MODERATE SPENDING LIKELIHOOD - MEDIUM PRIORITY';
  } else if (finalScore >= 40) {
    tier = 'COLD';
    tierDescription = 'LOW SPENDING LIKELIHOOD - LOW PRIORITY';
  } else {
    tier = 'FROZEN';
    tierDescription = 'MINIMAL SPENDING LIKELIHOOD - MINIMAL PRIORITY';
  }
  
  // Build comprehensive reasons array
  finalReasons.push(`=== UNIVERSAL FINAL SCORE: ${finalScore}/100 ===`);
  finalReasons.push(`=== TIER: ${tier} - ${tierDescription} ===`);
  finalReasons.push('');
  
  // Module breakdown with weights
  finalReasons.push('MODULE BREAKDOWN:');
  finalReasons.push(`• Urgency/Timing: ${urgencyScore}/100 (${(weights.urgency * 100)}% weight) = ${Math.round(urgencyScore * weights.urgency)} points`);
  finalReasons.push(`• Property Characteristics: ${propertyScore}/100 (${(weights.property * 100)}% weight) = ${Math.round(propertyScore * weights.property)} points`);
  finalReasons.push(`• Financial Capacity: ${financialScore}/100 (${(weights.financial * 100)}% weight) = ${Math.round(financialScore * weights.financial)} points`);
  finalReasons.push(`• Demographic Fit: ${demographicScore}/100 (${(weights.demographic * 100)}% weight) = ${Math.round(demographicScore * weights.demographic)} points`);
  finalReasons.push(`• Market Conditions: ${marketScore}/100 (${(weights.market * 100)}% weight) = ${Math.round(marketScore * weights.market)} points`);
  finalReasons.push('');
  
  // Top contributing factors
  const moduleScores = [
    { name: 'Urgency/Timing', score: urgencyScore, weight: weights.urgency },
    { name: 'Property Characteristics', score: propertyScore, weight: weights.property },
    { name: 'Financial Capacity', score: financialScore, weight: weights.financial },
    { name: 'Demographic Fit', score: demographicScore, weight: weights.demographic },
    { name: 'Market Conditions', score: marketScore, weight: weights.market }
  ];
  
  // Sort by weighted contribution
  moduleScores.sort((a, b) => (b.score * b.weight) - (a.score * a.weight));
  
  finalReasons.push('TOP CONTRIBUTING FACTORS:');
  moduleScores.forEach((module, index) => {
    const contribution = Math.round(module.score * module.weight);
    finalReasons.push(`${index + 1}. ${module.name}: ${contribution} points (${module.score}/100 score)`);
  });
  finalReasons.push('');
  
  // Spending likelihood analysis
  finalReasons.push('SPENDING LIKELIHOOD ANALYSIS:');
  if (finalScore >= 85) {
    finalReasons.push('🔥 ULTRA-HIGH: This lead is extremely likely to spend $10k-50k+ on home improvements');
    finalReasons.push('   • Contact within 24 hours');
    finalReasons.push('   • Offer premium services');
    finalReasons.push('   • Expect high-value projects');
  } else if (finalScore >= 75) {
    finalReasons.push('🔥 HIGH: This lead is very likely to spend $5k-25k on home improvements');
    finalReasons.push('   • Contact within 48 hours');
    finalReasons.push('   • Offer comprehensive services');
    finalReasons.push('   • Expect medium to high-value projects');
  } else if (finalScore >= 60) {
    finalReasons.push('🔥 MODERATE: This lead may spend $2k-15k on home improvements');
    finalReasons.push('   • Contact within 1 week');
    finalReasons.push('   • Offer standard services');
    finalReasons.push('   • Expect medium-value projects');
  } else if (finalScore >= 40) {
    finalReasons.push('🔥 LOW: This lead may spend $500-5k on home improvements');
    finalReasons.push('   • Contact within 2 weeks');
    finalReasons.push('   • Offer basic services');
    finalReasons.push('   • Expect low to medium-value projects');
  } else {
    finalReasons.push('🔥 MINIMAL: This lead is unlikely to spend significant amounts');
    finalReasons.push('   • Contact when time permits');
    finalReasons.push('   • Offer basic services only');
    finalReasons.push('   • Expect low-value projects');
  }
  
  // Learning data structure for System 3 optimization
  const learningData = {
    timestamp: new Date().toISOString(),
    property_id: $json.property_id || 'unknown',
    address: $json.address || 'unknown',
    final_score: finalScore,
    tier: tier,
    module_scores: {
      urgency: urgencyScore,
      property: propertyScore,
      financial: financialScore,
      demographic: demographicScore,
      market: marketScore
    },
    module_weights: weights,
    weighted_contributions: {
      urgency: Math.round(urgencyScore * weights.urgency),
      property: Math.round(propertyScore * weights.property),
      financial: Math.round(financialScore * weights.financial),
      demographic: Math.round(demographicScore * weights.demographic),
      market: Math.round(marketScore * weights.market)
    },
    data_quality: {
      urgency_data_complete: ($json.urgency_reasons && $json.urgency_reasons.length > 0),
      property_data_complete: ($json.property_reasons && $json.property_reasons.length > 0),
      financial_data_complete: ($json.financial_reasons && $json.financial_reasons.length > 0),
      demographic_data_complete: ($json.demographic_reasons && $json.demographic_reasons.length > 0),
      market_data_complete: ($json.market_reasons && $json.market_reasons.length > 0)
    }
  };
  
  // Return comprehensive result
  return [{
    json: {
      ...$json, // Preserve all original data and module scores
      
      // Final scoring results
      final_score: finalScore,
      tier: tier,
      tier_description: tierDescription,
      final_reasons: finalReasons,
      
      // Comprehensive breakdown
      final_breakdown: {
        urgency_contribution: Math.round(urgencyScore * weights.urgency),
        property_contribution: Math.round(propertyScore * weights.property),
        financial_contribution: Math.round(financialScore * weights.financial),
        demographic_contribution: Math.round(demographicScore * weights.demographic),
        market_contribution: Math.round(marketScore * weights.market),
        total_weighted_score: finalScore,
        weights_used: weights
      },
      
      // Learning data for System 3
      learning_data: learningData,
      
      // Customer tracking fields
      customer_wants: [], // To be filled by sales team
      actual_spending: null, // To be filled after conversion
      conversion_date: null, // To be filled after conversion
      project_value: null, // To be filled after conversion
      services_purchased: [], // To be filled after conversion
      
      // System 3 optimization fields
      prediction_accuracy: null, // To be calculated by System 3
      weight_optimization: null, // To be calculated by System 3
      model_improvement: null // To be calculated by System 3
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Universal Final Scoring:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      final_score: 30, // Safe default score
      tier: 'COLD',
      tier_description: 'ERROR IN CALCULATION - LOW PRIORITY',
      final_reasons: [
        "Error in final scoring calculation: +30 points (default)",
        "Check data quality and try again",
        error.message
      ],
      final_breakdown: {
        urgency_contribution: 0,
        property_contribution: 0,
        financial_contribution: 0,
        demographic_contribution: 0,
        market_contribution: 0,
        total_weighted_score: 30,
        weights_used: { urgency: 0.25, property: 0.20, financial: 0.25, demographic: 0.20, market: 0.10 }
      },
      learning_data: {
        timestamp: new Date().toISOString(),
        error: error.message,
        final_score: 30,
        tier: 'COLD'
      },
      error: error.message
    }
  }];
}
