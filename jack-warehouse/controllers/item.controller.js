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
      res.status(400).json({ error: err.message });
    }
  },


  update: async (req, res) => {
    res.status(200).json({ status: "item updated successfully" });
  },

  getall: async (req, res) => {
    res.status(200).json({ status: "items retrieved successfully" });
  },

  getbyid: async (req, res) => {
    try {
      // Get the ObjectId from the request parameters
      const objectId = mongoose.Types.ObjectId(req.params.id);
      
      // Find the item with the matching ObjectId
      const item = await Item.findOne({ _id: objectId });
      
      console.log(objectId);
      console.log(item);
  
      // If the item was not found, return a 400 response
      if (!item) {
        res.status(400).json({ status: "Item not found" });
      } else {
        // If the item was found, return it in the response  
        res.status(200).json({ status: "Item retrieved by id successfully", item });
      }
    } catch (err) {
      // Handle any errors that occur while finding the item
      // res.status(400).json({ status: "error trying to find item" });
      res.status(400).json({ error: err.message });
    }
  },
  

  // getbyid: async (req, res) => {
  //   res.status(200).json({ status: "item retrieved by id successfully" });
  // },

  delete: async (req, res) => {
    res.status(200).json({ status: "item deleted" });
  },
};

module.exports = itemController;
