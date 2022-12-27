const Item = require("../models/item.model"); // Import the item model

// Calculate the total weight of items in a row
async function calculateRowWeight(rowNum) {
  try {
    // Query the database for all items in the specified row
    const items = await Item.find({ row_num: rowNum });

    // Initialize the total weight to 0
    let totalWeight = 0;

    // Iterate through the items and sum their weights
    for (const item of items) {
      totalWeight += item.weight;
    }

    // Return the total weight
    return totalWeight;
  } catch (error) {
    // Handle any errors that occur while querying the database or calculating the total weight
    console.error(error);
    throw error;
  }
}

module.exports = {
  calculateRowWeight,
};
