const itemModel = require("../models/item.model");
const { calculateRowWeight } = require("../utilities/calculateRowWeight"); // Import the calculateRowWeight function from the utility module

const itemController = {
  create: async (req, res) => {
    try {
      // Create a new item using the request body
      const doc = new itemModel(req.body);

      // Calculate the total weight of items in the row
      const rowWeight = await calculateRowWeight(doc.row_num);

      if (doc.row_num > 25) {
        // console.log(doc.row_num)
        // Row number exceeds maximum of 25
        res.status(400).json({ status: "Maximum number of rows exceeded 25 rows" });
      } 
      else if (doc.row_num < 1)
      {
        // If row number is less than 1
        res.status(400).json({ status: "Row number cannot be less than 1" });
      }
      else 
      {
        if (rowWeight + doc.weight > 10000) 
        {
          // Row weight exceeds maximum capacity of 10 tonnes
          res.status(400).json({ status: "Maximum weight capacity of row exceeded 10 tonnes (10,000kg)" });
        } 
        else if (doc.weight < 1) {
          // If item weight is below 1 tonne
          res.status(400).json({ status: "Item is than 1 tonne" });
        } 
        else if (isNaN(doc.weight) || isNaN(doc.row_num)) {
          // If a non-numeric value is entered for item weight or row number
          res.status(400).json({ status: "Invalid value entered" });
        }
        else 
        {
          // Save the new item to the database
          await doc.save();
          // console.log(err, data);
          res.status(200).json({ status: "item added successfully" });
        }
      }
    } catch (err) {
      res.status(400).json({ status: "error trying to add item" });
    }
  },

  update: async (req, res) => {
    res.status(200).json({ status: "item updated successfully" });
  },

  getall: async (req, res) => {
    res.status(200).json({ status: "items retrieved successfully" });
  },

  getbyid: async (req, res) => {
    res.status(200).json({ status: "item retrieved by id successfully" });
  },

  delete: async (req, res) => {
    res.status(200).json({ status: "item deleted" });
  },
};

module.exports = itemController;
