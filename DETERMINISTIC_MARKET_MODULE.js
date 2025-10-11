// DETERMINISTIC MARKET CONDITIONS MODULE
// Uses consistent rounding and validation for reproducible results

try {
  // Initialize variables
  let marketScore = 0;
  let marketReasons = [];
  
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
  
  // 1. COMPETITOR DENSITY (Market Saturation) (0-100 points)
  let competitorScore = 0;
  const competitorCount = utils.validateNumericInput($json.competitor_count, 0, 0, 100);
  
  if (competitorCount <= 2) {
    competitorScore = 100; // Low competition - high opportunity
    marketReasons.push(`Low competition (${competitorCount} competitors): +100 points - HIGH MARKET OPPORTUNITY`);
  } else if (competitorCount <= 4) {
    competitorScore = 85; // Moderate competition - good opportunity
    marketReasons.push(`Moderate competition (${competitorCount} competitors): +85 points - GOOD MARKET OPPORTUNITY`);
  } else if (competitorCount <= 6) {
    competitorScore = 70; // Some competition - decent opportunity
    marketReasons.push(`Some competition (${competitorCount} competitors): +70 points - DECENT MARKET OPPORTUNITY`);
  } else if (competitorCount <= 10) {
    competitorScore = 50; // Moderate competition - moderate opportunity
    marketReasons.push(`Moderate competition (${competitorCount} competitors): +50 points - MODERATE MARKET OPPORTUNITY`);
  } else if (competitorCount <= 15) {
    competitorScore = 30; // High competition - limited opportunity
    marketReasons.push(`High competition (${competitorCount} competitors): +30 points - LIMITED MARKET OPPORTUNITY`);
  } else {
    competitorScore = 10; // Very high competition - minimal opportunity
    marketReasons.push(`Very high competition (${competitorCount} competitors): +10 points - MINIMAL MARKET OPPORTUNITY`);
  }
  
  utils.logCalculationStep('competitor_scoring', competitorCount, competitorScore, 'Competitor count-based market opportunity scoring');
  
  // 2. POPULATION DENSITY (Service Demand) (0-100 points)
  let populationScore = 0;
  const populationDensity = utils.validateNumericInput($json.population_density, 0, 0, 50000);
  
  if (populationDensity >= 4000) {
    populationScore = 100; // High density - high service demand
    marketReasons.push(`High population density (${populationDensity.toLocaleString()}/sqmi): +100 points - HIGH SERVICE DEMAND`);
  } else if (populationDensity >= 3000) {
    populationScore = 85; // Good density - good service demand
    marketReasons.push(`Good population density (${populationDensity.toLocaleString()}/sqmi): +85 points - GOOD SERVICE DEMAND`);
  } else if (populationDensity >= 2000) {
    populationScore = 70; // Moderate density - moderate service demand
    marketReasons.push(`Moderate population density (${populationDensity.toLocaleString()}/sqmi): +70 points - MODERATE SERVICE DEMAND`);
  } else if (populationDensity >= 1000) {
    populationScore = 50; // Lower density - lower service demand
    marketReasons.push(`Lower population density (${populationDensity.toLocaleString()}/sqmi): +50 points - LOWER SERVICE DEMAND`);
  } else if (populationDensity >= 500) {
    populationScore = 30; // Low density - low service demand
    marketReasons.push(`Low population density (${populationDensity.toLocaleString()}/sqmi): +30 points - LOW SERVICE DEMAND`);
  } else {
    populationScore = 10; // Very low density - minimal service demand
    marketReasons.push(`Very low population density (${populationDensity.toLocaleString()}/sqmi): +10 points - MINIMAL SERVICE DEMAND`);
  }
  
  utils.logCalculationStep('population_scoring', populationDensity, populationScore, 'Population density-based service demand scoring');
  
  // 3. MARKET GROWTH RATE (Economic Opportunity) (0-100 points)
  let growthScore = 0;
  const marketGrowthRate = utils.validateNumericInput($json.market_growth_rate, 0, -50, 100);
  
  if (marketGrowthRate >= 15) {
    growthScore = 100; // Very high growth - excellent opportunity
    marketReasons.push(`Very high market growth (${marketGrowthRate}%): +100 points - EXCELLENT ECONOMIC OPPORTUNITY`);
  } else if (marketGrowthRate >= 10) {
    growthScore = 85; // High growth - good opportunity
    marketReasons.push(`High market growth (${marketGrowthRate}%): +85 points - GOOD ECONOMIC OPPORTUNITY`);
  } else if (marketGrowthRate >= 7) {
    growthScore = 70; // Moderate growth - decent opportunity
    marketReasons.push(`Moderate market growth (${marketGrowthRate}%): +70 points - DECENT ECONOMIC OPPORTUNITY`);
  } else if (marketGrowthRate >= 5) {
    growthScore = 55; // Steady growth - moderate opportunity
    marketReasons.push(`Steady market growth (${marketGrowthRate}%): +55 points - MODERATE ECONOMIC OPPORTUNITY`);
  } else if (marketGrowthRate >= 0) {
    growthScore = 40; // Slow/no growth - limited opportunity
    marketReasons.push(`Slow/no market growth (${marketGrowthRate}%): +40 points - LIMITED ECONOMIC OPPORTUNITY`);
  } else {
    growthScore = 20; // Declining market - poor opportunity
    marketReasons.push(`Declining market (${marketGrowthRate}%): +20 points - POOR ECONOMIC OPPORTUNITY`);
  }
  
  utils.logCalculationStep('growth_scoring', marketGrowthRate, growthScore, 'Market growth rate-based economic opportunity scoring');
  
  // 4. UNEMPLOYMENT RATE (Economic Stability) (0-50 points)
  let unemploymentScore = 0;
  const unemploymentRate = utils.validateNumericInput($json.unemployment_rate, 5, 0, 50);
  
  if (unemploymentRate <= 3) {
    unemploymentScore = 50; // Very low unemployment - excellent economic stability
    marketReasons.push(`Very low unemployment (${unemploymentRate}%): +50 points - EXCELLENT ECONOMIC STABILITY`);
  } else if (unemploymentRate <= 4) {
    unemploymentScore = 40; // Low unemployment - good economic stability
    marketReasons.push(`Low unemployment (${unemploymentRate}%): +40 points - GOOD ECONOMIC STABILITY`);
  } else if (unemploymentRate <= 5) {
    unemploymentScore = 30; // Moderate unemployment - decent economic stability
    marketReasons.push(`Moderate unemployment (${unemploymentRate}%): +30 points - DECENT ECONOMIC STABILITY`);
  } else if (unemploymentRate <= 6) {
    unemploymentScore = 20; // Higher unemployment - limited economic stability
    marketReasons.push(`Higher unemployment (${unemploymentRate}%): +20 points - LIMITED ECONOMIC STABILITY`);
  } else if (unemploymentRate <= 8) {
    unemploymentScore = 10; // High unemployment - poor economic stability
    marketReasons.push(`High unemployment (${unemploymentRate}%): +10 points - POOR ECONOMIC STABILITY`);
  } else {
    unemploymentScore = 0; // Very high unemployment - very poor economic stability
    marketReasons.push(`Very high unemployment (${unemploymentRate}%): +0 points - VERY POOR ECONOMIC STABILITY`);
  }
  
  utils.logCalculationStep('unemployment_scoring', unemploymentRate, unemploymentScore, 'Unemployment rate-based economic stability scoring');
  
  // 5. INCOME TREND (Spending Power) (0-30 points)
  let incomeTrendScore = 0;
  const incomeTrend = $json.income_trend || 'stable';
  
  if (incomeTrend === 'increasing_fast') {
    incomeTrendScore = 30; // Rapidly increasing income - high spending power
    marketReasons.push(`Rapidly increasing income trend: +30 points - HIGH SPENDING POWER GROWTH`);
  } else if (incomeTrend === 'increasing') {
    incomeTrendScore = 25; // Increasing income - good spending power
    marketReasons.push(`Increasing income trend: +25 points - GOOD SPENDING POWER GROWTH`);
  } else if (incomeTrend === 'stable') {
    incomeTrendScore = 15; // Stable income - moderate spending power
    marketReasons.push(`Stable income trend: +15 points - MODERATE SPENDING POWER`);
  } else if (incomeTrend === 'decreasing') {
    incomeTrendScore = 5; // Decreasing income - limited spending power
    marketReasons.push(`Decreasing income trend: +5 points - LIMITED SPENDING POWER`);
  } else {
    incomeTrendScore = 10; // Unknown trend - moderate spending power
    marketReasons.push(`Unknown income trend: +10 points - MODERATE SPENDING POWER`);
  }
  
  utils.logCalculationStep('income_trend_scoring', incomeTrend, incomeTrendScore, 'Income trend-based spending power scoring');
  
  // 6. MARKET MATURITY (Service Opportunity) (0-20 points)
  let maturityScore = 0;
  const marketMaturity = $json.market_maturity || 'mature';
  
  if (marketMaturity === 'emerging') {
    maturityScore = 20; // Emerging market - high opportunity
    marketReasons.push(`Emerging market: +20 points - HIGH SERVICE OPPORTUNITY & GROWTH POTENTIAL`);
  } else if (marketMaturity === 'growing') {
    maturityScore = 15; // Growing market - good opportunity
    marketReasons.push(`Growing market: +15 points - GOOD SERVICE OPPORTUNITY & GROWTH POTENTIAL`);
  } else if (marketMaturity === 'mature') {
    maturityScore = 10; // Mature market - moderate opportunity
    marketReasons.push(`Mature market: +10 points - MODERATE SERVICE OPPORTUNITY`);
  } else if (marketMaturity === 'declining') {
    maturityScore = 5; // Declining market - limited opportunity
    marketReasons.push(`Declining market: +5 points - LIMITED SERVICE OPPORTUNITY`);
  } else {
    maturityScore = 8; // Unknown maturity - moderate opportunity
    marketReasons.push(`Unknown market maturity: +8 points - MODERATE SERVICE OPPORTUNITY`);
  }
  
  utils.logCalculationStep('maturity_scoring', marketMaturity, maturityScore, 'Market maturity-based service opportunity scoring');
  
  // Calculate total market score with precise rounding
  const rawScore = competitorScore + populationScore + growthScore + unemploymentScore + incomeTrendScore + maturityScore;
  marketScore = utils.roundScore(rawScore);
  
  utils.logCalculationStep('total_calculation', 
    `Competitors(${competitorScore}) + Population(${populationScore}) + Growth(${growthScore}) + Unemployment(${unemploymentScore}) + IncomeTrend(${incomeTrendScore}) + Maturity(${maturityScore})`, 
    marketScore, 
    'Final market score calculation');
  
  // Build comprehensive reasons
  marketReasons.push(`=== MARKET CONDITIONS SCORE: ${marketScore}/100 ===`);
  marketReasons.push(`Competitors: ${competitorScore} + Population: ${populationScore} + Growth: ${growthScore} + Unemployment: ${unemploymentScore} + Income Trend: ${incomeTrendScore} + Maturity: ${maturityScore} = ${marketScore}`);
  
  // Return the result with calculation log
  return [{
    json: {
      ...$json, // Preserve all original data
      
      // Market scoring results
      market_score: marketScore,
      market_reasons: marketReasons,
      
      // Detailed breakdown
      market_breakdown: {
        competitor_score: competitorScore,
        population_score: populationScore,
        growth_score: growthScore,
        unemployment_score: unemploymentScore,
        income_trend_score: incomeTrendScore,
        maturity_score: maturityScore,
        total_market_score: marketScore
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
  }];
  
} catch (error) {
  // Error handling with deterministic defaults
  console.error('Error in Deterministic Market Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      market_score: 40, // Safe default score
      market_reasons: [
        "Error in market calculation: defaulting to 40 points (deterministic fallback)",
        "Check data quality and try again",
        `Error: ${error.message}`
      ],
      market_breakdown: {
        competitor_score: 40,
        population_score: 40,
        growth_score: 0,
        unemployment_score: 0,
        income_trend_score: 0,
        maturity_score: 0,
        total_market_score: 40,
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
