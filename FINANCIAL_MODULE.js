// MODULE 3: FINANCIAL CAPACITY SCORE CALCULATION (FREE VERSION)
// Input: Property data object (with urgency_score and property_score already calculated)
// Output: financial_score (0-100) and financial_reasons array

try {
  // Initialize variables
  let financialScore = 0;
  let financialReasons = [];
  
  // 1. PROPERTY VALUE SCORING (0-40 points max) - Primary indicator
  let valueScore = 0;
  if ($json.property_value !== undefined && $json.property_value !== null) {
    const propertyValue = parseInt($json.property_value);
    
    if (propertyValue >= 600000) {
      valueScore = 40; // High value - likely to invest in services
      financialReasons.push(`High value property ($${propertyValue.toLocaleString()}): +40 points`);
    } else if (propertyValue >= 450000) {
      valueScore = 32;
      financialReasons.push(`Good value property ($${propertyValue.toLocaleString()}): +32 points`);
    } else if (propertyValue >= 300000) {
      valueScore = 24;
      financialReasons.push(`Moderate value property ($${propertyValue.toLocaleString()}): +24 points`);
    } else if (propertyValue >= 200000) {
      valueScore = 16;
      financialReasons.push(`Lower value property ($${propertyValue.toLocaleString()}): +16 points`);
    } else {
      valueScore = 8;
      financialReasons.push(`Low value property ($${propertyValue.toLocaleString()}): +8 points`);
    }
  } else {
    valueScore = 8; // Default for unknown value
    financialReasons.push("Unknown property value: +8 points (default)");
  }
  
  // 2. ESTIMATED INCOME SCORING (0-40 points max) - From Census data by ZIP
  let incomeScore = 0;
  if ($json.estimated_income !== undefined && $json.estimated_income !== null) {
    const estimatedIncome = parseInt($json.estimated_income);
    
    if (estimatedIncome >= 200000) {
      incomeScore = 40; // Very high income
      financialReasons.push(`Very high income ($${estimatedIncome.toLocaleString()}): +40 points`);
    } else if (estimatedIncome >= 150000) {
      incomeScore = 32;
      financialReasons.push(`High income ($${estimatedIncome.toLocaleString()}): +32 points`);
    } else if (estimatedIncome >= 100000) {
      incomeScore = 24;
      financialReasons.push(`Good income ($${estimatedIncome.toLocaleString()}): +24 points`);
    } else if (estimatedIncome >= 75000) {
      incomeScore = 16;
      financialReasons.push(`Moderate income ($${estimatedIncome.toLocaleString()}): +16 points`);
    } else if (estimatedIncome >= 50000) {
      incomeScore = 8;
      financialReasons.push(`Lower income ($${estimatedIncome.toLocaleString()}): +8 points`);
    } else {
      incomeScore = 4;
      financialReasons.push(`Low income ($${estimatedIncome.toLocaleString()}): +4 points`);
    }
  } else {
    incomeScore = 8; // Default for unknown income
    financialReasons.push("Unknown income: +8 points (default)");
  }
  
  // 3. PROPERTY TAX TREND SCORING (0-20 points max)
  let taxTrendBonus = 0;
  if ($json.property_tax_trend !== undefined && $json.property_tax_trend !== null) {
    const taxTrend = $json.property_tax_trend.toLowerCase();
    
    if (taxTrend === 'increasing') {
      taxTrendBonus = 20; // Increasing taxes = area is improving, property values rising
      financialReasons.push(`Increasing property taxes (area improving): +20 points`);
    } else if (taxTrend === 'stable') {
      taxTrendBonus = 10; // Stable taxes = consistent area
      financialReasons.push(`Stable property taxes: +10 points`);
    } else if (taxTrend === 'decreasing') {
      taxTrendBonus = -5; // Decreasing taxes = area declining
      financialReasons.push(`Decreasing property taxes (area declining): -5 points`);
    } else {
      taxTrendBonus = 0; // Unknown trend
      financialReasons.push(`Unknown tax trend: +0 points`);
    }
  } else {
    taxTrendBonus = 0; // Default for unknown tax trend
    financialReasons.push("Unknown tax trend: +0 points (default)");
  }
  
  // 4. CALCULATE FINAL FINANCIAL SCORE
  const rawScore = valueScore + incomeScore + taxTrendBonus;
  
  // Normalize to 0-100 scale (100 max becomes 100)
  financialScore = Math.min(rawScore, 100);
  
  // Ensure minimum score of 0
  financialScore = Math.max(financialScore, 0);
  
  // Add summary to reasons
  financialReasons.push(`Raw Score: ${rawScore}/100 → Final: ${financialScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including urgency_score and property_score)
      financial_score: financialScore,
      financial_reasons: financialReasons,
      financial_breakdown: {
        value_score: valueScore,
        income_score: incomeScore,
        tax_trend_bonus: taxTrendBonus,
        raw_score: rawScore,
        final_score: financialScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Financial Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      financial_score: 20, // Safe default score
      financial_reasons: [
        "Error in financial calculation: +20 points (default)",
        "Check data quality and try again"
      ],
      financial_breakdown: {
        value_score: 8,
        income_score: 8,
        tax_trend_bonus: 0,
        raw_score: 16,
        final_score: 20
      },
      error: error.message
    }
  }];
}

