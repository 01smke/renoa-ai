// SIMPLE DEBUG NODE - Check what's happening to each lead
// Place this AFTER your Function node but BEFORE your scoring modules

try {
  console.log("=== DEBUG NODE START ===");
  console.log("Received item:");
  console.log("Lead ID:", $json.lead_id);
  console.log("Contact Name:", $json.contact_name);
  console.log("Address:", $json.address);
  console.log("Property Value:", $json.property_value);
  console.log("Test Type:", $json.test_type);
  
  // Just pass the data through unchanged
  console.log("=== DEBUG NODE END ===");
  
  return [{ json: $json }];
  
} catch (error) {
  console.error("ERROR in Debug Node:", error);
  return [{ json: { error: error.message, original_data: $json } }];
}
