const mongoose = require("mongoose");
const itemModel = require("../models/item.model");
const { calculateRowWeight } = require("../utilities/calculateRowWeight"); // Import the calculateRowWeight function from the utility module

let rowCapacity = 10000 // rowCapacity as a global variable

const itemController = {
  create: async (req, res) => {
  try {  
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
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while adding item" });
    }
  },
  
  // Get all items/objects from the database
  getall: async (req, res) => {
    try {
      const items = await itemModel.find();
      res.status(200).json({ status: "Items retrieved successfully", items });
    } catch (err) {
      // Handle any errors that occur while finding the item
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while retrieving all items" });
    }
  },
  
  // Get an item by its id from the database
  getbyid: async (req, res) => {
    try {
      // Get the ObjectId from the request parameters
      const objectId = mongoose.Types.ObjectId(req.params.id);

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
    // Get the ObjectId from the request parameters
    const objectId = mongoose.Types.ObjectId(req.params.id);
    
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
    
      // Check if the updated item details are valid
      switch (true) {
        case item.row_num > 25:
          res.status(400).json({ status: "Maximum number of rows exceeded (25 rows max)" });
          break;
        case item.row_num < 1:
          res.status(400).json({ status: "Row number cannot be less than 1" });
          break;
        case item.weight < 1:
          res.status(400).json({ status: "Item cannot be less than 1 tonne" });
          break;
        case isNaN(item.weight) || isNaN(item.row_num):
          res.status(400).json({ status: "Invalid value entered" });
          break;
        default:

        // Calculate the total weight of items in the row
        const rowWeight = await calculateRowWeight(item.row_num);

        // Check if the updated item weight exceeds the row capacity
        if (rowWeight + item.weight > rowCapacity) {
          res.status(400).json({ status: `Row number (${item.row_num}) remaining storage space (${rowCapacity - rowWeight} tonnes) is less than ${item.name} weight (${item.weight} tonnes)` });
        } else {
          // Save the updated item to the database
          await item.save();
          res.status(200).json({ status: `Item updated successfully. New item is ${item.name}` });
        }
      }
    }
    } catch (err) {
      // Handle any errors that occur while updating the item
      res.status(400).json({ error: err.Message });
    }
  },

  // Delete an item from the database
  delete: async (req, res) => {
    try {
    // Get the ObjectId from the request parameters
    const objectId = mongoose.Types.ObjectId(req.params.id);
  
    // Find the item with the matching ObjectId
    const item = await itemModel.findById(objectId);
  
    // If the item was not found, return a 400 response
    if (!item) {
      res.status(400).json({ status: "Item not found" });
    } else {
      // Delete the item from the database
      await item.delete();
      res.status(200).json({ status: `${item.name} deleted successfully` });
    }

    } catch (err) {
      // Handle any errors that occur while deleting the item
      res.status(400).json({ error: err.message });
    }

  },

  // Get the total weight of all items in the inventory
  getTotalWeight: async (req, res) => {
    try {
    // Find all items in the inventory
    const items = await itemModel.find();
    
    // Calculate the total weight by summing the weight of each item
    const totalWeight = items.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);
    
    res.status(200).json({ status: "Total weight retrieved successfully", totalWeight });
    } catch (err) {
      res.status(400).json({ error: err.Message });
    }
  },

  // Get the average weight of items in the specified row
  getAverageWeight: async (req, res) => {
    try {
      // Get the row number from the request parameters
      const rowNum = req.params.row;

      // Find all items in the specified row
      const items = await itemModel.find({ row_num: rowNum });

      if (items.length === 0) {
        res.status(200).json({ status: "This row is empty" });
      } else {
        // Calculate the average weight by dividing the total weight by the number of items
        const totalWeight = items.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);
        const averageWeight = totalWeight / items.length;

        res.status(200).json({ status: "Average weight retrieved successfully", averageWeight });
      }
    } catch (err) {
      res.status(400).json({ error: err.Message });
    }
  },

  // Get a list of rows with no items in them
  getEmptyRows: async (req, res) => {
    try {
    // Find all items in the inventory
    const items = await itemModel.find();
    
    // Get a list of all rows that have items in them
    const rowsWithItems = items.map(item => item.row_num);
    
    // Get a list of all rows in the inventory
    const allRows = [...Array(25).keys()].map(rowNum => rowNum + 1);
    
    // Find the rows that do not have any items in them
    const emptyRows = allRows.filter(row => !rowsWithItems.includes(row));
    
    res.status(200).json({ status: "Empty rows retrieved successfully", emptyRows });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Get the remaining capacity of the specified row
  getRowCapacity: async (req, res) => {
    try {
      // Get the row number from the request parameters
      const rowNum = req.params.row;

      // Find all items in the specified row
      const items = await itemModel.find({ row_num: rowNum });

      // Calculate the total weight of items in the row
      const rowWeight = items.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);

      // Calculate the remaining capacity by subtracting the row weight from the row capacity
      const remainingCapacity = rowCapacity - rowWeight;

      res.status(200).json({ status: "Row capacity retrieved successfully", remainingCapacity  });
    } catch (err) {
      res.status(400).json({ error: err. Message });
    }
  },

  
};

module.exports = itemController;
