// FIXED FINANCIAL MODULE - Processes ALL items, not just the first one
// This works with "Run Once for All Items" mode

try {
  console.log("=== FIXED FINANCIAL MODULE START ===");
  
  // Get all input items
  const allItems = $input.all();
  console.log("Processing", allItems.length, "leads for financial scoring");
  
  // Process each item
  const processedItems = allItems.map((item, index) => {
    console.log(`Processing lead ${index + 1}: ${item.json.contact_name}`);
    
    // Initialize variables for this lead
    let financialScore = 0;
    let financialReasons = [];
    
    // Initialize calculation log
    const calculationLog = [];
    
    // Utility functions for consistent calculations
    const utils = {
      roundScore: (value) => Math.max(0, Math.min(100, Math.round(value))),
      roundCurrency: (value) => Math.round(value),
      roundPercentage: (value) => Math.round(value * 10) / 10,
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
    
    // 1. PROPERTY VALUE (Primary Wealth Indicator) (0-100 points)
    let wealthScore = 0;
    const propertyValue = utils.validateNumericInput(item.json.property_value, 0, 0, 10000000);
    
    if (propertyValue >= 800000) {
      wealthScore = 100;
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
    
    utils.logCalculationStep('wealth_scoring', propertyValue, wealthScore, 'Property value-based wealth scoring');
    
    // 2. ESTIMATED HOUSEHOLD INCOME (from Census by ZIP) (0-100 points)
    let incomeScore = 0;
    const estimatedIncome = utils.validateNumericInput(item.json.estimated_income, 0, 0, 1000000);
    
    if (estimatedIncome >= 250000) {
      incomeScore = 100;
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
    
    utils.logCalculationStep('income_scoring', estimatedIncome, incomeScore, 'Estimated income-based scoring');
    
    // 3. DOWN PAYMENT INDICATOR (Available Cash) (0-25 points)
    let downPaymentBonus = 0;
    const downPaymentAmount = utils.validateNumericInput(item.json.down_payment_amount, 0, 0, 10000000);
    const purchasePrice = utils.validateNumericInput(item.json.purchase_price, propertyValue, 0, 10000000);
    
    if (downPaymentAmount > 0 && purchasePrice > 0) {
      const downPaymentPercent = (downPaymentAmount / purchasePrice) * 100;
      const roundedPercent = utils.roundPercentage(downPaymentPercent);
      
      if (downPaymentPercent >= 30) {
        downPaymentBonus = 25;
        financialReasons.push(`Large down payment (${roundedPercent}%): +25 points - LOTS OF CASH AVAILABLE`);
      } else if (downPaymentPercent >= 20) {
        downPaymentBonus = 15;
        financialReasons.push(`Good down payment (${roundedPercent}%): +15 points - GOOD CASH AVAILABLE`);
      } else if (downPaymentPercent >= 10) {
        downPaymentBonus = 5;
        financialReasons.push(`Moderate down payment (${roundedPercent}%): +5 points - SOME CASH AVAILABLE`);
      } else {
        downPaymentBonus = -10;
        financialReasons.push(`Small down payment (${roundedPercent}%): -10 points - LEVERAGED (less cash)`);
      }
      
      utils.logCalculationStep('down_payment_analysis', `${downPaymentAmount}/${purchasePrice}`, downPaymentBonus, `Down payment: ${roundedPercent}%`);
    } else {
      // Estimate based on property value and recent purchase
      const daysSincePurchase = utils.validateNumericInput(item.json.days_since_purchase, 365, 0, 3650);
      
      if (propertyValue >= 600000 && daysSincePurchase <= 90) {
        downPaymentBonus = 15;
        financialReasons.push(`High-value recent purchase: +15 points - LIKELY SUBSTANTIAL DOWN PAYMENT`);
      } else if (propertyValue >= 400000 && daysSincePurchase <= 180) {
        downPaymentBonus = 10;
        financialReasons.push(`Moderate-value recent purchase: +10 points - LIKELY GOOD DOWN PAYMENT`);
      } else {
        downPaymentBonus = 0;
        financialReasons.push(`No down payment data available: +0 points (default)`);
      }
      
      utils.logCalculationStep('down_payment_estimate', `${propertyValue}/${daysSincePurchase}`, downPaymentBonus, 'Estimated based on property value and purchase timing');
    }
    
    // 4. PROPERTY TAX TREND (Wealth Maintenance Indicator) (0-15 points)
    let taxTrendBonus = 0;
    const propertyTaxTrend = item.json.property_tax_trend;
    
    if (propertyTaxTrend === 'increasing') {
      taxTrendBonus = 15;
      financialReasons.push(`Increasing property taxes: +15 points - HIGH PROPERTY VALUE = WEALTH`);
    } else if (propertyTaxTrend === 'stable') {
      taxTrendBonus = 10;
      financialReasons.push(`Stable property taxes: +10 points - MAINTAINED VALUE`);
    } else if (propertyTaxTrend === 'decreasing') {
      taxTrendBonus = 5;
      financialReasons.push(`Decreasing property taxes: +5 points - LOWER VALUE`);
    } else {
      taxTrendBonus = 0;
      financialReasons.push(`Unknown tax trend: +0 points (default)`);
    }
    
    utils.logCalculationStep('tax_trend_analysis', propertyTaxTrend, taxTrendBonus, 'Property tax trend scoring');
    
    // 5. VALUE TO INCOME RATIO (Financial Capacity) (0-15 points)
    let ratioBonus = 0;
    if (propertyValue > 0 && estimatedIncome > 0) {
      const valueToIncomeRatio = propertyValue / estimatedIncome;
      const roundedRatio = Math.round(valueToIncomeRatio * 10) / 10;
      
      if (valueToIncomeRatio <= 3) {
        ratioBonus = 15;
        financialReasons.push(`Conservative purchase (${roundedRatio}x income): +15 points - LOTS OF DISPOSABLE INCOME`);
      } else if (valueToIncomeRatio <= 4) {
        ratioBonus = 10;
        financialReasons.push(`Moderate purchase (${roundedRatio}x income): +10 points - GOOD DISPOSABLE INCOME`);
      } else if (valueToIncomeRatio <= 5) {
        ratioBonus = 5;
        financialReasons.push(`Standard purchase (${roundedRatio}x income): +5 points - SOME DISPOSABLE INCOME`);
      } else if (valueToIncomeRatio <= 6) {
        ratioBonus = -10;
        financialReasons.push(`Stretched purchase (${roundedRatio}x income): -10 points - HOUSE POOR (limited disposable income)`);
      } else {
        ratioBonus = -5;
        financialReasons.push(`Moderate stretch (${roundedRatio}x income): +0 points - MODERATE DISPOSABLE INCOME`);
      }
      
      utils.logCalculationStep('income_ratio_analysis', `${propertyValue}/${estimatedIncome}`, ratioBonus, `Value to income ratio: ${roundedRatio}x`);
    } else {
      ratioBonus = 0;
      financialReasons.push(`No income ratio data available: +0 points (default)`);
      utils.logCalculationStep('income_ratio_estimate', `${propertyValue}/${estimatedIncome}`, ratioBonus, 'No data for income ratio calculation');
    }
    
    // Calculate base financial score (weighted average of wealth and income)
    const baseFinancialScore = (wealthScore * 0.6) + (incomeScore * 0.4);
    
    // Calculate final financial score with all bonuses
    const rawFinancialScore = baseFinancialScore + downPaymentBonus + taxTrendBonus + ratioBonus;
    financialScore = utils.roundScore(rawFinancialScore);
    
    utils.logCalculationStep('final_calculation', 
      `Base(${Math.round(baseFinancialScore)}) + Down(${downPaymentBonus}) + Tax(${taxTrendBonus}) + Ratio(${ratioBonus})`, 
      financialScore, 
      'Final financial score calculation');
    
    // Build comprehensive reasons
    financialReasons.push(`=== FINANCIAL CAPACITY SCORE: ${financialScore}/100 ===`);
    financialReasons.push(`Base Score: ${Math.round(baseFinancialScore)} + Bonuses: ${downPaymentBonus + taxTrendBonus + ratioBonus} = FINAL FINANCIAL SCORE: ${financialScore}/100`);
    
    // Return the result for this lead
    return {
      json: {
        ...item.json, // Preserve all original data
        
        // Financial scoring results
        financial_score: financialScore,
        financial_reasons: financialReasons,
        
        // Detailed breakdown
        financial_breakdown: {
          wealth_score: wealthScore,
          income_score: incomeScore,
          base_financial_score: Math.round(baseFinancialScore),
          down_payment_bonus: downPaymentBonus,
          tax_trend_bonus: taxTrendBonus,
          ratio_bonus: ratioBonus,
          final_financial_score: financialScore
        },
        
        // Calculation log for debugging
        calculation_log: calculationLog,
        
        // Validation metadata
        validation_metadata: {
          deterministic: true,
          rounding_applied: true,
          random_functions_eliminated: true
        }
      }
    };
  });
  
  console.log("=== FIXED FINANCIAL MODULE END ===");
  console.log("Returning", processedItems.length, "processed leads");
  
  // Return all processed items
  return processedItems;
  
} catch (error) {
  console.error('Error in Fixed Financial Module:', error);
  
  // Return error for all items
  const allItems = $input.all();
  return allItems.map((item) => ({
    json: {
      ...item.json,
      financial_score: 0,
      financial_reasons: [`Error in financial calculation: ${error.message}`],
      error: error.message
    }
  }));
}
