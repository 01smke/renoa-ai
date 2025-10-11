// ENHANCED MODULE 5: MARKET CONDITIONS SCORE CALCULATION
// Ultra-detailed scoring focused on market saturation, competitor analysis, and economic indicators

try {
  // Initialize variables
  let marketScore = 0;
  let marketReasons = [];
  
  // 1. MARKET SATURATION (Competition Level) (0-100 points)
  let saturationScore = 0;
  
  // Competitor density analysis
  if ($json.competitor_count !== undefined && $json.competitor_count !== null) {
    const competitorCount = parseInt($json.competitor_count);
    
    if (competitorCount <= 2) {
      saturationScore = 100; // Low competition = high opportunity
      marketReasons.push(`Low competition (${competitorCount} competitors): +100 points - HIGH OPPORTUNITY`);
    } else if (competitorCount <= 5) {
      saturationScore = 80; // Moderate competition
      marketReasons.push(`Moderate competition (${competitorCount} competitors): +80 points - GOOD OPPORTUNITY`);
    } else if (competitorCount <= 10) {
      saturationScore = 60; // High competition
      marketReasons.push(`High competition (${competitorCount} competitors): +60 points - MODERATE OPPORTUNITY`);
    } else if (competitorCount <= 20) {
      saturationScore = 40; // Very high competition
      marketReasons.push(`Very high competition (${competitorCount} competitors): +40 points - LIMITED OPPORTUNITY`);
    } else {
      saturationScore = 20; // Saturated market
      marketReasons.push(`Saturated market (${competitorCount}+ competitors): +20 points - LOW OPPORTUNITY`);
    }
  } else {
    // Estimate based on population density
    if ($json.population_density !== undefined && $json.population_density !== null) {
      const populationDensity = parseInt($json.population_density);
      if (populationDensity <= 1000) {
        saturationScore = 90; // Rural = low competition
        marketReasons.push(`Rural area (${populationDensity} people/sq mi): +90 points - LOW COMPETITION`);
      } else if (populationDensity <= 5000) {
        saturationScore = 70; // Suburban = moderate competition
        marketReasons.push(`Suburban area (${populationDensity} people/sq mi): +70 points - MODERATE COMPETITION`);
      } else {
        saturationScore = 50; // Urban = high competition
        marketReasons.push(`Urban area (${populationDensity} people/sq mi): +50 points - HIGH COMPETITION`);
      }
    } else {
      saturationScore = 60; // Default moderate competition
      marketReasons.push(`Unknown competition level: +60 points (default)`);
    }
  }
  
  // 2. MARKET GROWTH (Economic Health) (0-80 points)
  let growthScore = 0;
  
  // Property value growth trend
  if ($json.market_growth_rate !== undefined && $json.market_growth_rate !== null) {
    const growthRate = parseFloat($json.market_growth_rate);
    
    if (growthRate >= 15) {
      growthScore = 80; // Rapidly growing market
      marketReasons.push(`Rapid market growth (${growthRate}%): +80 points - BOOMING MARKET`);
    } else if (growthRate >= 10) {
      growthScore = 70; // Strong growth
      marketReasons.push(`Strong market growth (${growthRate}%): +70 points - STRONG MARKET`);
    } else if (growthRate >= 5) {
      growthScore = 60; // Moderate growth
      marketReasons.push(`Moderate market growth (${growthRate}%): +60 points - HEALTHY MARKET`);
    } else if (growthRate >= 0) {
      growthScore = 40; // Stable market
      marketReasons.push(`Stable market (${growthRate}%): +40 points - STABLE MARKET`);
    } else {
      growthScore = 20; // Declining market
      marketReasons.push(`Declining market (${growthRate}%): +20 points - WEAK MARKET`);
    }
  } else {
    // Estimate based on neighborhood value trend
    if ($json.neighborhood_value_trend !== undefined && $json.neighborhood_value_trend !== null) {
      const valueTrend = $json.neighborhood_value_trend.toLowerCase();
      if (valueTrend === 'increasing_fast' || valueTrend === 'increasing_10plus') {
        growthScore = 70; // Rapidly increasing values
        marketReasons.push(`Rapidly increasing neighborhood values: +70 points - STRONG MARKET`);
      } else if (valueTrend === 'increasing') {
        growthScore = 60; // Increasing values
        marketReasons.push(`Increasing neighborhood values: +60 points - HEALTHY MARKET`);
      } else if (valueTrend === 'stable') {
        growthScore = 40; // Stable values
        marketReasons.push(`Stable neighborhood values: +40 points - STABLE MARKET`);
      } else {
        growthScore = 20; // Declining values
        marketReasons.push(`Declining neighborhood values: +20 points - WEAK MARKET`);
      }
    } else {
      growthScore = 50; // Default moderate growth
      marketReasons.push(`Unknown market growth: +50 points (default)`);
    }
  }
  
  // 3. ECONOMIC INDICATORS (Spending Power) (0-60 points)
  let economicScore = 0;
  
  // Unemployment rate
  if ($json.unemployment_rate !== undefined && $json.unemployment_rate !== null) {
    const unemploymentRate = parseFloat($json.unemployment_rate);
    
    if (unemploymentRate <= 3) {
      economicScore += 30; // Very low unemployment = high spending power
      marketReasons.push(`Very low unemployment (${unemploymentRate}%): +30 points - HIGH SPENDING POWER`);
    } else if (unemploymentRate <= 5) {
      economicScore += 25; // Low unemployment
      marketReasons.push(`Low unemployment (${unemploymentRate}%): +25 points - GOOD SPENDING POWER`);
    } else if (unemploymentRate <= 7) {
      economicScore += 15; // Moderate unemployment
      marketReasons.push(`Moderate unemployment (${unemploymentRate}%): +15 points - MODERATE SPENDING POWER`);
    } else if (unemploymentRate <= 10) {
      economicScore += 5; // High unemployment
      marketReasons.push(`High unemployment (${unemploymentRate}%): +5 points - LIMITED SPENDING POWER`);
    } else {
      economicScore += 0; // Very high unemployment
      marketReasons.push(`Very high unemployment (${unemploymentRate}%): +0 points - LOW SPENDING POWER`);
    }
  } else {
    economicScore += 15; // Default moderate unemployment
    marketReasons.push(`Unknown unemployment rate: +15 points (default)`);
  }
  
  // Median household income trend
  if ($json.income_trend !== undefined && $json.income_trend !== null) {
    const incomeTrend = $json.income_trend.toLowerCase();
    if (incomeTrend === 'increasing_fast' || incomeTrend === 'increasing_10plus') {
      economicScore += 30; // Rapidly increasing income
      marketReasons.push(`Rapidly increasing income: +30 points - STRONG ECONOMIC GROWTH`);
    } else if (incomeTrend === 'increasing') {
      economicScore += 20; // Increasing income
      marketReasons.push(`Increasing income: +20 points - GOOD ECONOMIC GROWTH`);
    } else if (incomeTrend === 'stable') {
      economicScore += 10; // Stable income
      marketReasons.push(`Stable income: +10 points - STABLE ECONOMIC CONDITIONS`);
    } else {
      economicScore += 0; // Declining income
      marketReasons.push(`Declining income: +0 points - WEAK ECONOMIC CONDITIONS`);
    }
  } else {
    economicScore += 15; // Default moderate income trend
    marketReasons.push(`Unknown income trend: +15 points (default)`);
  }
  
  // Cap economic score at 60 points
  economicScore = Math.min(economicScore, 60);
  
  // 4. SEASONAL MARKET CONDITIONS (0-40 points)
  let seasonalScore = 0;
  const currentMonth = new Date().getMonth() + 1;
  
  // Spring and fall are peak seasons for home improvement
  if ([3, 4, 5].includes(currentMonth)) {
    seasonalScore = 40; // Spring - peak season
    marketReasons.push(`Spring season (March-May): +40 points - PEAK HOME IMPROVEMENT SEASON`);
  } else if ([9, 10].includes(currentMonth)) {
    seasonalScore = 35; // Fall - high season
    marketReasons.push(`Fall season (September-October): +35 points - HIGH HOME IMPROVEMENT SEASON`);
  } else if ([6, 7, 8].includes(currentMonth)) {
    seasonalScore = 25; // Summer - moderate season
    marketReasons.push(`Summer season (June-August): +25 points - MODERATE HOME IMPROVEMENT SEASON`);
  } else {
    seasonalScore = 15; // Winter - low season
    marketReasons.push(`Winter season (November-February): +15 points - LOW HOME IMPROVEMENT SEASON`);
  }
  
  // 5. MARKET MATURITY (0-30 points)
  let maturityScore = 0;
  
  // Market maturity based on property age distribution
  if ($json.market_maturity !== undefined && $json.market_maturity !== null) {
    const maturity = $json.market_maturity.toLowerCase();
    if (maturity === 'emerging') {
      maturityScore = 30; // Emerging market = high opportunity
      marketReasons.push(`Emerging market: +30 points - HIGH OPPORTUNITY`);
    } else if (maturity === 'growing') {
      maturityScore = 25; // Growing market
      marketReasons.push(`Growing market: +25 points - GOOD OPPORTUNITY`);
    } else if (maturity === 'mature') {
      maturityScore = 15; // Mature market
      marketReasons.push(`Mature market: +15 points - MODERATE OPPORTUNITY`);
    } else if (maturity === 'declining') {
      maturityScore = 5; // Declining market
      marketReasons.push(`Declining market: +5 points - LOW OPPORTUNITY`);
    } else {
      maturityScore = 20; // Unknown maturity
      marketReasons.push(`Unknown market maturity: +20 points (default)`);
    }
  } else {
    // Estimate based on property age
    if ($json.year_built !== undefined && $json.year_built !== null) {
      const yearBuilt = parseInt($json.year_built);
      const currentYear = new Date().getFullYear();
      const propertyAge = currentYear - yearBuilt;
      
      if (propertyAge <= 10) {
        maturityScore = 25; // New development = emerging market
        marketReasons.push(`New development (${propertyAge} years old): +25 points - EMERGING MARKET`);
      } else if (propertyAge <= 25) {
        maturityScore = 20; // Established development = growing market
        marketReasons.push(`Established development (${propertyAge} years old): +20 points - GROWING MARKET`);
      } else {
        maturityScore = 15; // Older development = mature market
        marketReasons.push(`Older development (${propertyAge} years old): +15 points - MATURE MARKET`);
      }
    } else {
      maturityScore = 20; // Default moderate maturity
      marketReasons.push(`Unknown market maturity: +20 points (default)`);
    }
  }
  
  // 6. CALCULATE FINAL MARKET SCORE
  const rawScore = saturationScore + growthScore + economicScore + seasonalScore + maturityScore;
  
  // Normalize to 0-100 scale (310 max becomes 100)
  marketScore = Math.round((rawScore / 310) * 100);
  
  // Ensure bounds
  marketScore = Math.min(marketScore, 100);
  marketScore = Math.max(marketScore, 0);
  
  // Add summary to reasons
  marketReasons.push(`Raw Score: ${rawScore}/310 → Normalized: ${marketScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data (including enhanced urgency_score, property_score, financial_score, and demographic_score)
      market_score: marketScore,
      market_reasons: marketReasons,
      market_breakdown: {
        saturation_score: saturationScore,
        growth_score: growthScore,
        economic_score: economicScore,
        seasonal_score: seasonalScore,
        maturity_score: maturityScore,
        raw_score: rawScore,
        normalized_score: marketScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Enhanced Market Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      market_score: 40, // Safe default score
      market_reasons: [
        "Error in market calculation: +40 points (default)",
        "Check data quality and try again"
      ],
      market_breakdown: {
        saturation_score: 60,
        growth_score: 50,
        economic_score: 30,
        seasonal_score: 25,
        maturity_score: 20,
        raw_score: 185,
        normalized_score: 40
      },
      error: error.message
    }
  }];
}
