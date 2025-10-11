// DEBUG FUNCTION NODE - Simple debugging to see what's happening
// Copy this ENTIRE code into your Function node

try {
  console.log("=== FUNCTION NODE DEBUG START ===");
  
  // Simple test data - just 3 leads to start
  const testLeads = [
    {
      "lead_id": "LEAD_001",
      "contact_name": "John Smith",
      "address": "123 Oak Street, Chicago, IL 60614",
      "property_value": 750000,
      "test_type": "LEAD_1"
    },
    {
      "lead_id": "LEAD_002", 
      "contact_name": "Sarah Johnson",
      "address": "456 Pine Avenue, Austin, TX 78701",
      "property_value": 450000,
      "test_type": "LEAD_2"
    },
    {
      "lead_id": "LEAD_003",
      "contact_name": "Mike Rodriguez", 
      "address": "789 Elm Drive, Phoenix, AZ 85001",
      "property_value": 320000,
      "test_type": "LEAD_3"
    }
  ];
  
  console.log("Step 1: Created test data array");
  console.log("Array length:", testLeads.length);
  console.log("Contact names:", testLeads.map(lead => lead.contact_name));
  
  // Convert to N8N format
  const output = testLeads.map(lead => ({ json: lead }));
  
  console.log("Step 2: Converted to N8N format");
  console.log("Output array length:", output.length);
  console.log("First output contact:", output[0].json.contact_name);
  console.log("Last output contact:", output[output.length - 1].json.contact_name);
  
  console.log("Step 3: About to return output");
  console.log("=== FUNCTION NODE DEBUG END ===");
  
  // Return the output
  return output;
  
} catch (error) {
  console.error("ERROR in Function Node:", error);
  
  return [{
    json: {
      lead_id: "ERROR",
      contact_name: "ERROR",
      address: "ERROR",
      error: error.message
    }
  }];
}
