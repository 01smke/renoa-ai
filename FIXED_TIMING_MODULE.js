// FIXED MODULE 1: URGENCY/TIMING SCORE CALCULATION
// Input: Property data object
// Output: urgency_score (0-100) and urgency_reasons array

try {
  // Initialize variables
  let urgencyScore = 0;
  let urgencyReasons = [];
  
  // Get current date for calculations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  
  // 1. NEW HOMEOWNER STATUS SCORING (0-40 points max)
  let newHomeownerScore = 0;
  if ($json.days_since_purchase !== undefined && $json.days_since_purchase !== null) {
    const daysSincePurchase = parseInt($json.days_since_purchase);
    
    if (daysSincePurchase <= 90) {
      newHomeownerScore = 40; // Reduced from 100
      urgencyReasons.push("New homeowner (≤90 days): +40 points");
    } else if (daysSincePurchase <= 180) {
      newHomeownerScore = 30;
      urgencyReasons.push("Recent homeowner (91-180 days): +30 points");
    } else if (daysSincePurchase <= 365) {
      newHomeownerScore = 20;
      urgencyReasons.push("Moderate homeowner (181-365 days): +20 points");
    } else {
      newHomeownerScore = 10;
      urgencyReasons.push("Established homeowner (>365 days): +10 points");
    }
  } else {
    newHomeownerScore = 5;
    urgencyReasons.push("Unknown homeowner status: +5 points (default)");
  }
  
  // 2. SEASONAL TIMING SCORING (0-25 points max)
  let seasonalBonus = 0;
  const serviceType = 'landscaping'; // We'll determine this properly later
  
  if (serviceType === 'landscaping') {
    if ([3, 4, 5].includes(currentMonth)) {
      seasonalBonus = 25;
      urgencyReasons.push("Spring peak season for landscaping: +25 points");
    } else if ([9, 10].includes(currentMonth)) {
      seasonalBonus = 15;
      urgencyReasons.push("Fall shoulder season for landscaping: +15 points");
    } else {
      seasonalBonus = 5;
      urgencyReasons.push("Off-season for landscaping: +5 points");
    }
  } else if (serviceType === 'roofing') {
    if ([4, 5, 6, 7, 8, 9].includes(currentMonth)) {
      seasonalBonus = 25;
      urgencyReasons.push("Peak roofing season (warm months): +25 points");
    } else {
      seasonalBonus = 10;
      urgencyReasons.push("Off-season for roofing: +10 points");
    }
  } else if (serviceType === 'hvac') {
    if ([6, 7, 8, 12, 1, 2].includes(currentMonth)) {
      seasonalBonus = 25;
      urgencyReasons.push("Peak HVAC season (summer/winter): +25 points");
    } else {
      seasonalBonus = 10;
      urgencyReasons.push("Shoulder season for HVAC: +10 points");
    }
  } else {
    seasonalBonus = 15;
    urgencyReasons.push("Standard seasonal timing: +15 points");
  }
  
  // 3. RECENT PERMITS SCORING (0-25 points max)
  let permitScore = 0;
  if ($json.days_since_permit !== undefined && $json.days_since_permit !== null) {
    const daysSincePermit = parseInt($json.days_since_permit);
    
    if (daysSincePermit <= 30) {
      permitScore = 25; // Reduced from 90
      urgencyReasons.push("Recent permit (≤30 days): +25 points");
    } else if (daysSincePermit <= 90) {
      permitScore = 20;
      urgencyReasons.push("Moderate permit age (31-90 days): +20 points");
    } else if (daysSincePermit <= 180) {
      permitScore = 15;
      urgencyReasons.push("Older permit (91-180 days): +15 points");
    } else {
      permitScore = 5;
      urgencyReasons.push("Old permit (>180 days): +5 points");
    }
  } else {
    urgencyReasons.push("No permit data available: +0 points");
  }
  
  // 4. CODE VIOLATIONS SCORING (0-25 points max)
  let violationScore = 0;
  if ($json.days_since_violation !== undefined && $json.days_since_violation !== null) {
    const daysSinceViolation = parseInt($json.days_since_violation);
    
    if (daysSinceViolation <= 60) {
      violationScore = 25; // Reduced from 85
      urgencyReasons.push("Recent violation (≤60 days): +25 points");
    } else if (daysSinceViolation <= 180) {
      violationScore = 15;
      urgencyReasons.push("Moderate violation age (61-180 days): +15 points");
    } else {
      violationScore = 5;
      urgencyReasons.push("Old violation (>180 days): +5 points");
    }
  } else {
    urgencyReasons.push("No violation data available: +0 points");
  }
  
  // 5. CALCULATE FINAL TIMING SCORE (0-115 points max, then normalize to 0-100)
  const rawScore = newHomeownerScore + seasonalBonus + permitScore + violationScore;
  
  // Normalize to 0-100 scale (115 max becomes 100)
  urgencyScore = Math.round((rawScore / 115) * 100);
  
  // Ensure bounds
  urgencyScore = Math.min(urgencyScore, 100);
  urgencyScore = Math.max(urgencyScore, 0);
  
  // Add summary to reasons
  urgencyReasons.push(`Raw Score: ${rawScore}/115 → Normalized: ${urgencyScore}/100`);
  
  // Return the result
  return [{
    json: {
      ...$json, // Preserve all original data
      urgency_score: urgencyScore,
      urgency_reasons: urgencyReasons,
      timing_breakdown: {
        new_homeowner_score: newHomeownerScore,
        seasonal_bonus: seasonalBonus,
        permit_score: permitScore,
        violation_score: violationScore,
        raw_score: rawScore,
        normalized_score: urgencyScore
      }
    }
  }];
  
} catch (error) {
  // Error handling - return safe defaults
  console.error('Error in Timing Module:', error);
  
  return [{
    json: {
      ...$json, // Preserve original data
      urgency_score: 20, // Safe default score
      urgency_reasons: [
        "Error in timing calculation: +20 points (default)",
        "Check data quality and try again"
      ],
      timing_breakdown: {
        new_homeowner_score: 10,
        seasonal_bonus: 10,
        permit_score: 0,
        violation_score: 0,
        raw_score: 20,
        normalized_score: 20
      },
      error: error.message
    }
  }];
}
