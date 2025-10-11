// FIXED DEBUG NODE - Process ALL items, not just the first one
// This works with "Run Once for All Items" mode

try {
  console.log("=== FIXED DEBUG NODE START ===");
  
  // Get all input items
  const allItems = $input.all();
  console.log("Total items received:", allItems.length);
  
  // Process each item
  const processedItems = allItems.map((item, index) => {
    console.log(`Processing item ${index + 1}:`);
    console.log("Lead ID:", item.json.lead_id);
    console.log("Contact Name:", item.json.contact_name);
    console.log("Address:", item.json.address);
    console.log("Property Value:", item.json.property_value);
    console.log("Test Type:", item.json.test_type);
    
    // Return the item unchanged
    return { json: item.json };
  });
  
  console.log("=== FIXED DEBUG NODE END ===");
  console.log("Returning", processedItems.length, "items");
  
  // Return all processed items
  return processedItems;
  
} catch (error) {
  console.error("ERROR in Fixed Debug Node:", error);
  
  // Return error for all items
  const allItems = $input.all();
  return allItems.map(() => ({ 
    json: { 
      error: error.message, 
      timestamp: new Date().toISOString() 
    } 
  }));
}
