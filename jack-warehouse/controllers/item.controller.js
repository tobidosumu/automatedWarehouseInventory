const mongoose = require("mongoose");
const itemModel = require("../models/item.model");
const { calculateRowWeight } = require("../utilities/calculateRowWeight"); // Import the calculateRowWeight function from the utility module

const itemController = {
  create: async (req, res) => {
  try {
  let rowCapacity = 10000
  
    // Create a new item using the request body
    const doc = new itemModel(req.body);
  
    // Calculate the total weight of items in the row
    const rowWeight = await calculateRowWeight(doc.row_num);
  
    switch (true) {
      case doc.row_num > 25:
        res.status(400).json({ status: "Maximum number of rows exceeded (25 rows max)" });
        break;
      case doc.row_num < 1:
        res.status(400).json({ status: "Row number cannot be less than 1" });
        break;
      case rowWeight + doc.weight > rowCapacity:
        res.status(400).json({ status: `Row number (${doc.row_num}) remaining storage space (${rowCapacity - rowWeight} tonnes) is less than ${doc.name} weight (${doc.weight} tonnes)` });
        break;
      case doc.weight < 1:
        res.status(400).json({ status: "Item cannot be less than 1 tonne" });
        break;
      case isNaN(doc.weight) || isNaN(doc.row_num):
        res.status(400).json({ status: "Invalid value entered" });
        break;
      default:
        // Save the new item to the database
        await doc.save();
        res.status(200).json({ status: `${doc.name} added successfully` });
    }
    } catch (err) {
      // Handle any errors that occur while finding the item
      // res.status(400).json({ error: err.message });
      res.status(400).json({ status: "Error occurred while adding item" });
    }
  },
  
  // Get all items/objects from the database
  getall: async (req, res) => {
    try {
      const items = await itemModel.find();
      res.status(200).json({ status: "Items retrieved successfully", items });
    } catch (err) {
      // Handle any errors that occur while finding the item
      // res.status(400).json({ error: err.message });
      res.status(400).json({ status: "Error occurred while retrieving all items" });

    }
  },
  
  // Get an item by its id from the database
  getbyid: async (req, res) => {
    try {
      // Get the ObjectId from the request parameters
      const objectId = mongoose.Types.ObjectId(req.params.id);
      console.log(objectId)
      // Find the item with the matching ObjectId
      const item = await itemModel.findById(objectId);

      // If the item was not found, return a 400 response
      if (!item) {
        res.status(400).json({ status: "Item not found" });
      } else {
        // If the item was found, return it in the response
        res.status(200).json({ status: "Item retrieved by id successfully", item });
      }
    } catch (err) {
      // Handle any errors that occur while finding the item
      res.status(400).json({ status: "Error occurred while retrieving item" });
      // res.status(400).json({ error: err.message });
    }
  },

  // Update an item detail using the _id field
  update: async (req, res) => {
    try {
    // Find the item with the matching ObjectId
    const item = await itemModel.findById(objectId);
    
    // If the item was not found, return a 400 response
    if (!item) {
      res.status(400).json({ status: "Item not found" });
    } else {
      // Update the item details with the request body
      item.name = req.body.name;
      item.weight = req.body.weight;
      item.row_num = req.body.row_num;
    
      // Calculate the total weight of items in the row
      const rowWeight = await calculateRowWeight(item.row_num);
    
      // Check if the updated item weight exceeds the row capacity
      if (rowWeight + item.weight > rowCapacity) {
        res.status(400).json({ status: `Row number (${item.row_num}) remaining storage space (${rowCapacity - rowWeight} tonnes) is less than ${item.name} weight (${item.weight} tonnes)` });
      } else {
        // Save the updated item to the database
        await item.save();
        res.status(200).json({ status: `${item.name} updated successfully` });
      }
    }
    } catch (err) {
      // Handle any errors that occur while updating the item
      res.status(400).json({ error: err. Message });
    }
  },

  delete: async (req, res) => {
    try {
      // Get the ObjectId from the request parameters
      const objectId = mongoose.Types.ObjectId(req.params.id);
  
      // Delete the item with the matching ObjectId
      const result = await itemModel.deleteOne({ _id: objectId });
  
      // If no items were deleted, return a 400 response
      if (result.deletedCount === 0) {
        res.status(400).json({ status: "Item not found" });
      } else {
        // If the item was deleted, return a 200 response
        res.status(200).json({ status: "Item deleted successfully" });
      }
    } catch (err) {
      // Handle any errors that occur while deleting the item
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "user not updated successfully" });
    }
  },
  
};

module.exports = itemController;
