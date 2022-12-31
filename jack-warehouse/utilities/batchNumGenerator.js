// Import the item model to access the production date, expiration date, and tag fields
const Item = require("../models/item.model");

function batchNumGenerator(tag) {
  // Generate a unique 6-digit batch number based on the tag name
  const num = Math.floor(Math.random() * (1000000 - 100000) + 100000);
  const batchNum = `${tag}-${num}`;
  return batchNum;
}


module.exports = batchNumGenerator;
