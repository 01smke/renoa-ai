// FIXED FINAL SCORING MODULE - Processes ALL items, not just the first one
// This works with "Run Once for All Items" mode

try {
  console.log("=== FIXED FINAL SCORING MODULE START ===");
  
  // Get all input items
  const allItems = $input.all();
  console.log("Processing", allItems.length, "leads for final scoring");
  
  // Process each item
  const processedItems = allItems.map((item, index) => {
    console.log(`Processing lead ${index + 1}: ${item.json.contact_name}`);
    
    // Initialize variables for this lead
    let finalScore = 0;
    let tier = 'Tier 3';
    let leadValue = 50;
    let finalReasons = [];
    
    // Get and validate all module scores
    const urgencyScore = Math.max(0, Math.min(100, parseInt(item.json.urgency_score) || 0));
    const propertyScore = Math.max(0, Math.min(100, parseInt(item.json.property_score) || 0));
    const financialScore = Math.max(0, Math.min(100, parseInt(item.json.financial_score) || 0));
    const demographicScore = Math.max(0, Math.min(100, parseInt(item.json.demographic_score) || 0));
    const marketScore = Math.max(0, Math.min(100, parseInt(item.json.market_score) || 0));
    
    console.log(`Lead ${index + 1} scores - Urgency: ${urgencyScore}, Property: ${propertyScore}, Financial: ${financialScore}, Demographic: ${demographicScore}, Market: ${marketScore}`);
    
    // UNIVERSAL WEIGHTS (Optimized for general spending likelihood)
    const weights = {
      urgency: 0.25,      // 25% - Timing is crucial for new homeowners
      property: 0.20,     // 20% - Property characteristics drive renovation needs
      financial: 0.25,    // 25% - Financial capacity determines spending ability
      demographic: 0.20,  // 20% - Demographics predict spending behavior
      market: 0.10        // 10% - Market conditions affect opportunity
    };
    
    // Calculate weighted contributions with precise rounding
    const urgencyWeighted = Math.round(urgencyScore * weights.urgency);
    const propertyWeighted = Math.round(propertyScore * weights.property);
    const financialWeighted = Math.round(financialScore * weights.financial);
    const demographicWeighted = Math.round(demographicScore * weights.demographic);
    const marketWeighted = Math.round(marketScore * weights.market);
    
    // Calculate final weighted score with precise rounding
    const weightedSum = urgencyWeighted + propertyWeighted + financialWeighted + demographicWeighted + marketWeighted;
    finalScore = Math.max(0, Math.min(100, Math.round(weightedSum)));
    
    console.log(`Lead ${index + 1} final calculation: ${urgencyWeighted}+${propertyWeighted}+${financialWeighted}+${demographicWeighted}+${marketWeighted}=${finalScore}`);
    
    // Build detailed scoring breakdown
    finalReasons.push(`=== FINAL SCORE: ${finalScore}/100 ===`);
    finalReasons.push(`Urgency Score: ${urgencyScore}/100 × ${(weights.urgency * 100).toFixed(1)}% = ${urgencyWeighted} points`);
    finalReasons.push(`Property Score: ${propertyScore}/100 × ${(weights.property * 100).toFixed(1)}% = ${propertyWeighted} points`);
    finalReasons.push(`Financial Score: ${financialScore}/100 × ${(weights.financial * 100).toFixed(1)}% = ${financialWeighted} points`);
    finalReasons.push(`Demographic Score: ${demographicScore}/100 × ${(weights.demographic * 100).toFixed(1)}% = ${demographicWeighted} points`);
    finalReasons.push(`Market Score: ${marketScore}/100 × ${(weights.market * 100).toFixed(1)}% = ${marketWeighted} points`);
    finalReasons.push(`Final Score: ${finalScore}/100`);
    
    // Assign tier based on final score (deterministic thresholds)
    if (finalScore >= 85) {
      tier = 'HOT';
      leadValue = Math.round(150 + (finalScore - 85) * 3); // $150-195 range
      finalReasons.push(`HOT Lead (85+ points): ULTRA-HIGH SPENDING LIKELIHOOD`);
    } else if (finalScore >= 75) {
      tier = 'WARM';
      leadValue = Math.round(100 + (finalScore - 75) * 2.5); // $100-125 range
      finalReasons.push(`WARM Lead (75-84 points): HIGH SPENDING LIKELIHOOD`);
    } else if (finalScore >= 60) {
      tier = 'COOL';
      leadValue = Math.round(50 + (finalScore - 60) * 2); // $50-80 range
      finalReasons.push(`COOL Lead (60-74 points): MODERATE SPENDING LIKELIHOOD`);
    } else if (finalScore >= 40) {
      tier = 'COLD';
      leadValue = Math.round(25 + (finalScore - 40) * 1.25); // $25-50 range
      finalReasons.push(`COLD Lead (40-59 points): LOW SPENDING LIKELIHOOD`);
    } else {
      tier = 'FROZEN';
      leadValue = 0;
      finalReasons.push(`FROZEN Lead (<40 points): MINIMAL SPENDING LIKELIHOOD`);
    }
    
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
    const daysSincePurchase = parseInt(item.json.days_since_purchase) || 0;
    const yearBuilt = parseInt(item.json.year_built) || 0;
    
    if (daysSincePurchase <= 180) {
      keyFactors.push('New Homeowner');
    }
    if (item.json.has_pool === true) {
      keyFactors.push('Pool Property');
    }
    if (yearBuilt <= 2005) {
      keyFactors.push('Aging Property');
    }
    
    console.log(`Lead ${index + 1} assigned tier: ${tier}, lead value: $${leadValue}`);
    
    // Return the result for this lead
    return {
      json: {
        ...item.json, // Preserve all original data
        
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
          service_weights: weights
        },
        
        // Validation and consistency data
        validation_summary: {
          input_scores_valid: true,
          calculations_deterministic: true,
          rounding_applied: true,
          random_functions_eliminated: true
        },
        
        // Deterministic metadata
        calculation_metadata: {
          timestamp: new Date().toISOString(),
          deterministic: true,
          rounding_precision: 'whole_numbers',
          random_functions_used: false,
          llm_calls_made: false
        }
      }
    };
  });
  
  console.log("=== FIXED FINAL SCORING MODULE END ===");
  console.log("Returning", processedItems.length, "processed leads");
  
  // Return all processed items
  return processedItems;
  
} catch (error) {
  console.error('Error in Fixed Final Scoring Module:', error);
  
  // Return error for all items
  const allItems = $input.all();
  return allItems.map((item) => ({
    json: {
      ...item.json,
      final_score: 50,
      tier: 'ERROR',
      lead_value: 0,
      final_reasons: [`Error in final scoring: ${error.message}`],
      error: error.message
    }
  }));
}
