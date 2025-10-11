// ENHANCED MODULE 3: FINANCIAL CAPACITY SCORE CALCULATION
// Ultra-detailed scoring focused on wealth and spending capacity indicators

try {
  // Initialize variables
  let financialScore = 0;
  let financialReasons = [];
  
  // 1. PROPERTY VALUE (Primary Wealth Indicator) (0-100 points)
  let wealthScore = 0;
  if ($json.property_value !== undefined && $json.property_value !== null) {
    const propertyValue = parseInt($json.property_value);
    
    if (propertyValue >= 800000) {
      wealthScore = 100; // Premium wealth
      financialReasons.push(`Premium property ($${propertyValue.toLocaleString()}): +100 points - PREMIUM WEALTH`);
    } else if (propertyValue >= 600000) {
      wealthScore = 85;
      financialReasons.push(`High-value property ($${propertyValue.toLocaleString()}): +85 points - HIGH WEALTH`);
    } else if (propertyValue >= 500000) {
      wealthScore = 75;
      financialReasons.push(`Good-value property ($${propertyValue.toLocaleString()}): +75 points - GOOD WEALTH`);
    } else if (propertyValue >= 400000) {
      wealthScore = 65;
      financialReasons.push(`Moderate-value property ($${propertyValue.toLocaleString()}): +65 points - MODERATE WEALTH`);
    } else if (propertyValue >= 300000) {
      wealthScore = 50;
      financialReasons.push(`Lower-value property ($${propertyValue.toLocaleString()}): +50 points - LIMITED WEALTH`);
    } else if (propertyValue >= 200000) {
      wealthScore = 30;
      financialReasons.push(`Low-value property ($${propertyValue.toLocaleString()}): +30 points - LOW WEALTH`);
    } else {
      wealthScore = 15;
      financialReasons.push(`Very low-value property ($${propertyValue.toLocaleString()}): +15 points - MINIMAL WEALTH`);
    }
  } else {
    wealthScore = 30; // Default for unknown value
    financialReasons.push(`Unknown property value: +30 points (default)`);
  }
  
  // 2. ESTIMATED HOUSEHOLD INCOME (from Census by ZIP) (0-100 points)
  let incomeScore = 0;
  if ($json.estimated_income !== undefined && $json.estimated_income !== null) {
    const estimatedIncome = parseInt($json.estimated_income);
    
    if (estimatedIncome >= 250000) {
      incomeScore = 100; // Very high income
      financialReasons.push(`Very high income ($${estimatedIncome.toLocaleString()}): +100 points - PREMIUM INCOME`);
    } else if (estimatedIncome >= 200000) {
      incomeScore = 90;
      financialReasons.push(`High income ($${estimatedIncome.toLocaleString()}): +90 points - HIGH INCOME`);
    } else if (estimatedIncome >= 150000) {
      incomeScore = 80;
      financialReasons.push(`Good income ($${estimatedIncome.toLocaleString()}): +80 points - GOOD INCOME`);
    } else if (estimatedIncome >= 125000) {
      incomeScore = 70;
      financialReasons.push(`Above-average income ($${estimatedIncome.toLocaleString()}): +70 points - ABOVE-AVERAGE INCOME`);
    } else if (estimatedIncome >= 100000) {
      incomeScore = 60;
      financialReasons.push(`Average income ($${estimatedIncome.toLocaleString()}): +60 points - AVERAGE INCOME`);
    } else if (estimatedIncome >= 75000) {
      incomeScore = 45;
      financialReasons.push(`Below-average income ($${estimatedIncome.toLocaleString()}): +45 points - BELOW-AVERAGE INCOME`);
    } else if (estimatedIncome >= 50000) {
      incomeScore = 25;
      financialReasons.push(`Low income ($${estimatedIncome.toLocaleString()}): +25 points - LOW INCOME`);
    } else {
      incomeScore = 10;
      financialReasons.push(`Very low income ($${estimatedIncome.toLocaleString()}): +10 points - VERY LOW INCOME`);
    }
  } else {
    incomeScore = 40; // Default for unknown income
    financialReasons.push(`Unknown income: +40 points (default)`);
  }
  
  // 3. DOWN PAYMENT INDICATOR (Available Cash) (0-25 points)
  let downPaymentBonus = 0;
  if ($json.down_payment_amount !== undefined && $json.down_payment_amount !== null && $json.property_value !== undefined && $json.property_value !== null) {
    const downPaymentAmount = parseInt($json.down_payment_amount);
    const purchasePrice = parseInt($json.property_value);
    const downPaymentPercent = (downPaymentAmount / purchasePrice) * 100;
    
    if (downPaymentPercent >= 30) {
      downPaymentBonus = 25; // Lots of cash available
      financialReasons.push(`Large down payment (${downPaymentPercent.toFixed(1)}%): +25 points - LOTS OF CASH AVAILABLE`);
    } else if (downPaymentPercent >= 20) {
      downPaymentBonus = 15;
      financialReasons.push(`Good down payment (${downPaymentPercent.toFixed(1)}%): +15 points - GOOD CASH AVAILABLE`);
    } else if (downPaymentPercent >= 10) {
      downPaymentBonus = 5;
      financialReasons.push(`Moderate down payment (${downPaymentPercent.toFixed(1)}%): +5 points - SOME CASH AVAILABLE`);
    } else {
      downPaymentBonus = -10; // Leveraged, less cash available
      financialReasons.push(`Small down payment (${downPaymentPercent.toFixed(1)}%): -10 points - LEVERAGED (less cash)`);
    }
  } else {
    // Estimate based on property value and recent purchase
    if ($json.property_value >= 600000 && $json.days_since_purchase <= 90) {
      downPaymentBonus = 15; // High-value recent purchase likely had substantial down payment
      financialReasons.push(`High-value recent purchase: +15 points - LIKELY SUBSTANTIAL DOWN PAYMENT`);
    } else if ($json.property_value >= 400000) {
      downPaymentBonus = 5;
      financialReasons.push(`Moderate-value property: +5 points - LIKELY MODERATE DOWN PAYMENT`);
    } else {
      downPaymentBonus = 0;
      financialReasons.push(`No down payment data available: +0 points (default)`);
    }
  }
  
  // 4. PROPERTY TAX TREND (Wealth Growth Indicator) (0-20 points)
  let taxTrendBonus = 0;
  if ($json.property_tax_trend !== undefined && $json.property_tax_trend !== null) {
    const taxTrend = $json.property_tax_trend.toLowerCase();
    
    if (taxTrend === 'increasing_fast' || taxTrend === 'increasing_10plus') {
      taxTrendBonus = 20; // Area is rapidly improving
      financialReasons.push(`Rapidly increasing property taxes: +20 points - AREA RAPIDLY IMPROVING`);
    } else if (taxTrend === 'increasing') {
      taxTrendBonus = 10; // Area is improving
      financialReasons.push(`Increasing property taxes: +10 points - AREA IMPROVING`);
    } else if (taxTrend === 'stable') {
      taxTrendBonus = 5; // Stable area
      financialReasons.push(`Stable property taxes: +5 points - STABLE AREA`);
    } else if (taxTrend === 'decreasing') {
      taxTrendBonus = -5; // Area declining
      financialReasons.push(`Decreasing property taxes: -5 points - AREA DECLINING`);
    } else {
      taxTrendBonus = 0; // Unknown trend
      financialReasons.push(`Unknown tax trend: +0 points`);
    }
  } else {
    taxTrendBonus = 5; // Default for unknown tax trend
    financialReasons.push(`Unknown tax trend: +5 points (default)`);
  }
  
  // 5. VALUE-TO-INCOME RATIO (Spending Capacity) (0-15 points)
  let ratioBonus = 0;
  if ($json.property_value !== undefined && $json.property_value !== null && $json.estimated_income !== undefined && $json.estimated_income !== null) {
    const propertyValue = parseInt($json.property_value);
    const estimatedIncome = parseInt($json.estimated_income);
    const valueToIncomeRatio = propertyValue / estimatedIncome;
    
    if (valueToIncomeRatio <= 3) {
      ratioBonus = 15; // Conservative purchase = lots of disposable income
      financialReasons.push(`Conservative purchase (${valueToIncomeRatio.toFixed(1)}x income): +15 points - LOTS OF DISPOSABLE INCOME`);
    } else if (valueToIncomeRatio <= 4) {
      ratioBonus = 10;
      financialReasons.push(`Moderate purchase (${valueToIncomeRatio.toFixed(1)}x income): +10 points - GOOD DISPOSABLE INCOME`);
    } else if (valueToIncomeRatio <= 5) {
      ratioBonus = 5;
      financialReasons.push(`Standard purchase (${valueToIncomeRatio.toFixed(1)}x income): +5 points - SOME DISPOSABLE INCOME`);
    } else if (valueToIncomeRatio > 6) {
      ratioBonus = -10; // House poor
      financialReasons.push(`Stretched purchase (${valueToIncomeRatio.toFixed(1)}x income): -10 points - HOUSE POOR (limited disposable income)`);
    } else {
      ratioBonus = 0;
      financialReasons.push(`Moderate stretch (${valueToIncomeRatio.toFixed(1)}x income): +0 points - MODERATE DISPOSABLE INCOME`);
    }
  } else {
    ratioBonus = 5; // Default for unknown ratio
    financialReasons.push(`Unknown value-to-income ratio: +5 points (default)`);
  }
  
  // 6. CALCULATE FINAL FINANCIAL SCORE
  const baseFinancialScore = (wealthScore + incomeScore) / 2;
  const rawScore = baseFinancialScore + downPaymentBonus + taxTrendBonus + ratioBonus;
  
  // Normalize to 0-100 scale
  financialScore = Math.max(Math.min(rawScore, 100), 0);
  
  // Add summary to reasons
  financialReasons.push(`Base Score: ${Math.round(baseFinancialScore)} + Bonuses: ${downPaymentBonus + taxTrendBonus + ratioBonus} = FINAL FINANCIAL SCORE: ${Math.round(financialScore)}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including enhanced urgency_score and property_score)
      financial_score: Math.round(financialScore),
      financial_reasons: financialReasons,
      financial_breakdown: {
        wealth_score: wealthScore,
        income_score: incomeScore,
        base_financial_score: Math.round(baseFinancialScore),
        down_payment_bonus: downPaymentBonus,
        tax_trend_bonus: taxTrendBonus,
        ratio_bonus: ratioBonus,
        final_financial_score: Math.round(financialScore)
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Enhanced Financial Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      financial_score: 30, // Safe default score
      financial_reasons: [
        "Error in financial calculation: +30 points (default)",
        "Check data quality and try again"
      ],
      financial_breakdown: {
        wealth_score: 15,
        income_score: 15,
        base_financial_score: 15,
        down_payment_bonus: 5,
        tax_trend_bonus: 5,
        ratio_bonus: 5,
        final_financial_score: 30
      },
      error: error.message
    }
  }];
}
