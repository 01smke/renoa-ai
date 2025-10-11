// ENHANCED MODULE 1: URGENCY/TIMING SCORE CALCULATION
// Ultra-detailed scoring focused on "Will they spend money soon?"

try {
  // Initialize variables
  let urgencyScore = 0;
  let urgencyReasons = [];
  
  // Get current date for calculations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // 1. NEW HOMEOWNER STATUS (0-100 points) - Peak buying window
  let baseUrgencyScore = 0;
  if ($json.days_since_purchase !== undefined && $json.days_since_purchase !== null) {
    const daysSincePurchase = parseInt($json.days_since_purchase);
    
    if (daysSincePurchase <= 30) {
      baseUrgencyScore = 100; // Peak buying window
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
  } else {
    baseUrgencyScore = 10; // Default for unknown status
    urgencyReasons.push(`Unknown homeowner status: +10 points (default)`);
  }
  
  // 2. SEASONAL TIMING BONUS (0-20 points)
  let seasonalBonus = 0;
  if ([3, 4, 5].includes(currentMonth)) {
    seasonalBonus = 20; // Spring - high activity
    urgencyReasons.push(`Spring season (Mar-May): +20 points - HIGH ACTIVITY`);
  } else if ([9, 10].includes(currentMonth)) {
    seasonalBonus = 15; // Fall - high activity
    urgencyReasons.push(`Fall season (Sep-Oct): +15 points - HIGH ACTIVITY`);
  } else if ([6, 7, 8].includes(currentMonth)) {
    seasonalBonus = 10; // Summer - moderate
    urgencyReasons.push(`Summer season (Jun-Aug): +10 points - MODERATE ACTIVITY`);
  } else {
    seasonalBonus = 5; // Winter - low
    urgencyReasons.push(`Winter season (Nov-Feb): +5 points - LOW ACTIVITY`);
  }
  
  // 3. PURCHASE PRICE VS MARKET (Overpaying Indicator) (0-20 points)
  let overpayBonus = 0;
  if ($json.property_value !== undefined && $json.property_value !== null && $json.market_value !== undefined && $json.market_value !== null) {
    const purchasePrice = parseInt($json.property_value);
    const marketValue = parseInt($json.market_value);
    const priceDifferential = (purchasePrice / marketValue) - 1;
    
    if (priceDifferential > 0.10) {
      overpayBonus = 20; // Paid 10%+ over market - has budget and motivation
      urgencyReasons.push(`Overpaid 10%+ (${(priceDifferential * 100).toFixed(1)}%): +20 points - HIGH BUDGET & MOTIVATION`);
    } else if (priceDifferential > 0.05) {
      overpayBonus = 10; // Paid 5-10% over market
      urgencyReasons.push(`Overpaid 5-10% (${(priceDifferential * 100).toFixed(1)}%): +10 points - GOOD BUDGET`);
    } else if (priceDifferential > 0) {
      overpayBonus = 5; // Paid slightly over market
      urgencyReasons.push(`Overpaid slightly (${(priceDifferential * 100).toFixed(1)}%): +5 points - SOME BUDGET`);
    } else {
      overpayBonus = 0; // Paid at or below market
      urgencyReasons.push(`Paid at/below market: +0 points - STANDARD PURCHASE`);
    }
  } else {
    // Estimate overpay based on property characteristics
    if ($json.property_value >= 600000 && $json.days_since_purchase <= 90) {
      overpayBonus = 10; // High-value recent purchase likely involved competition
      urgencyReasons.push(`High-value recent purchase: +10 points - LIKELY COMPETITIVE BIDDING`);
    } else {
      overpayBonus = 0;
      urgencyReasons.push(`No overpay data available: +0 points (default)`);
    }
  }
  
  // 4. RECENT PERMITS (Urgency Signal) (0-25 points)
  let permitScore = 0;
  if ($json.days_since_permit !== undefined && $json.days_since_permit !== null) {
    const daysSincePermit = parseInt($json.days_since_permit);
    
    if (daysSincePermit <= 30) {
      permitScore = 25; // Very recent permit - active improvement
      urgencyReasons.push(`Recent permit (≤30 days): +25 points - ACTIVE IMPROVEMENT`);
    } else if (daysSincePermit <= 90) {
      permitScore = 20;
      urgencyReasons.push(`Recent permit (31-90 days): +20 points - RECENT IMPROVEMENT`);
    } else if (daysSincePermit <= 180) {
      permitScore = 15;
      urgencyReasons.push(`Older permit (91-180 days): +15 points - SOME IMPROVEMENT`);
    } else if (daysSincePermit <= 365) {
      permitScore = 10;
      urgencyReasons.push(`Old permit (181-365 days): +10 points - PAST IMPROVEMENT`);
    } else {
      permitScore = 0;
      urgencyReasons.push(`Very old permit (>365 days): +0 points - NO RECENT ACTIVITY`);
    }
  } else {
    urgencyReasons.push(`No permit data available: +0 points`);
  }
  
  // 5. CODE VIOLATIONS (Urgency Signal) (0-25 points)
  let violationScore = 0;
  if ($json.days_since_violation !== undefined && $json.days_since_violation !== null) {
    const daysSinceViolation = parseInt($json.days_since_violation);
    
    if (daysSinceViolation <= 30) {
      violationScore = 25; // Recent violation - immediate need
      urgencyReasons.push(`Recent violation (≤30 days): +25 points - IMMEDIATE NEED`);
    } else if (daysSinceViolation <= 90) {
      violationScore = 20;
      urgencyReasons.push(`Recent violation (31-90 days): +20 points - URGENT NEED`);
    } else if (daysSinceViolation <= 180) {
      violationScore = 15;
      urgencyReasons.push(`Older violation (91-180 days): +15 points - NEEDS ATTENTION`);
    } else if (daysSinceViolation <= 365) {
      violationScore = 10;
      urgencyReasons.push(`Old violation (181-365 days): +10 points - SOME NEED`);
    } else {
      violationScore = 0;
      urgencyReasons.push(`Very old violation (>365 days): +0 points - RESOLVED`);
    }
  } else {
    urgencyReasons.push(`No violation data available: +0 points`);
  }
  
  // 6. CALCULATE FINAL URGENCY SCORE
  urgencyScore = baseUrgencyScore + seasonalBonus + overpayBonus + permitScore + violationScore;
  
  // Cap at maximum score
  urgencyScore = Math.min(urgencyScore, 100);
  
  // Ensure minimum score of 0
  urgencyScore = Math.max(urgencyScore, 0);
  
  // Add summary to reasons
  urgencyReasons.push(`FINAL URGENCY SCORE: ${urgencyScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data
      urgency_score: urgencyScore,
      urgency_reasons: urgencyReasons,
      urgency_breakdown: {
        base_urgency_score: baseUrgencyScore,
        seasonal_bonus: seasonalBonus,
        overpay_bonus: overpayBonus,
        permit_score: permitScore,
        violation_score: violationScore,
        final_urgency_score: urgencyScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Enhanced Urgency Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      urgency_score: 20, // Safe default score
      urgency_reasons: [
        "Error in urgency calculation: +20 points (default)",
        "Check data quality and try again"
      ],
      urgency_breakdown: {
        base_urgency_score: 10,
        seasonal_bonus: 10,
        overpay_bonus: 0,
        permit_score: 0,
        violation_score: 0,
        final_urgency_score: 20
      },
      error: error.message
    }
  }];
}







