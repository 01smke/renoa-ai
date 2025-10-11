// TROUBLESHOOTING WORKFLOW - Step by Step Debugging
// This will help identify where the data is getting lost

try {
  console.log("=== TROUBLESHOOTING WORKFLOW START ===");
  
  // Step 1: Check what data we're receiving
  console.log("Step 1: Input Data Check");
  console.log("Number of items received:", $input.all().length);
  console.log("Current item data:", JSON.stringify($json, null, 2));
  
  // Step 2: Check if this is the first lead (John Smith)
  const isJohnSmith = $json.contact_name === "John Smith";
  console.log("Step 2: Lead Identity Check");
  console.log("Is this John Smith?", isJohnSmith);
  console.log("Contact Name:", $json.contact_name);
  console.log("Lead ID:", $json.lead_id);
  console.log("Property ID:", $json.property_id);
  
  // Step 3: Check data completeness
  console.log("Step 3: Data Completeness Check");
  const requiredFields = [
    'contact_name', 'address', 'property_value', 'year_built', 
    'building_sqft', 'bedrooms', 'days_since_purchase'
  ];
  
  const missingFields = requiredFields.filter(field => 
    $json[field] === undefined || $json[field] === null || $json[field] === ''
  );
  
  console.log("Missing required fields:", missingFields);
  console.log("Data completeness:", missingFields.length === 0 ? "COMPLETE" : "INCOMPLETE");
  
  // Step 4: Check for data corruption
  console.log("Step 4: Data Corruption Check");
  console.log("Property Value Type:", typeof $json.property_value);
  console.log("Property Value Valid:", !isNaN(parseInt($json.property_value)));
  console.log("Days Since Purchase Type:", typeof $json.days_since_purchase);
  console.log("Days Since Purchase Valid:", !isNaN(parseInt($json.days_since_purchase)));
  
  // Step 5: Simulate a simple scoring calculation
  console.log("Step 5: Simple Scoring Test");
  const propertyValue = parseInt($json.property_value) || 0;
  const daysSincePurchase = parseInt($json.days_since_purchase) || 0;
  
  // Simple urgency score based on days since purchase
  let urgencyScore = 0;
  if (daysSincePurchase <= 30) urgencyScore = 100;
  else if (daysSincePurchase <= 60) urgencyScore = 95;
  else if (daysSincePurchase <= 90) urgencyScore = 85;
  else if (daysSincePurchase <= 120) urgencyScore = 70;
  else if (daysSincePurchase <= 180) urgencyScore = 50;
  else urgencyScore = 10;
  
  console.log("Calculated Urgency Score:", urgencyScore);
  
  // Step 6: Check if data should be filtered out
  console.log("Step 6: Filter Check");
  const shouldBeFiltered = propertyValue < 150000 || urgencyScore < 10;
  console.log("Should be filtered?", shouldBeFiltered);
  console.log("Reason:", shouldBeFiltered ? "Low property value or urgency" : "Passes filters");
  
  // Step 7: Generate output for next step
  console.log("Step 7: Output Generation");
  const output = {
    ...$json,
    troubleshooting_data: {
      lead_processed: true,
      contact_name: $json.contact_name,
      lead_id: $json.lead_id,
      property_id: $json.property_id,
      data_complete: missingFields.length === 0,
      missing_fields: missingFields,
      urgency_score_test: urgencyScore,
      should_be_filtered: shouldBeFiltered,
      processing_timestamp: new Date().toISOString()
    },
    urgency_score: urgencyScore,
    property_score: Math.min(100, Math.round(propertyValue / 10000)), // Simple property score
    financial_score: Math.min(100, Math.round(propertyValue / 8000)), // Simple financial score
    demographic_score: 50, // Default demographic score
    market_score: 50, // Default market score
    final_score: Math.round((urgencyScore + Math.min(100, Math.round(propertyValue / 10000)) + Math.min(100, Math.round(propertyValue / 8000)) + 50 + 50) / 5),
    tier: urgencyScore >= 70 ? "Tier 1" : urgencyScore >= 50 ? "Tier 2" : "Tier 3"
  };
  
  console.log("Step 8: Final Output");
  console.log("Final Score:", output.final_score);
  console.log("Tier:", output.tier);
  console.log("=== TROUBLESHOOTING WORKFLOW END ===");
  
  return [{ json: output }];
  
} catch (error) {
  console.error("ERROR in Troubleshooting Workflow:", error);
  
  return [{
    json: {
      ...$json,
      troubleshooting_data: {
        lead_processed: false,
        error: error.message,
        contact_name: $json.contact_name || "UNKNOWN",
        processing_timestamp: new Date().toISOString()
      },
      urgency_score: 0,
      property_score: 0,
      financial_score: 0,
      demographic_score: 0,
      market_score: 0,
      final_score: 0,
      tier: "ERROR"
    }
  }];
}
