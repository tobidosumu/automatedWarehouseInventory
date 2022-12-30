const mongoose = require("mongoose");
const itemModel = require("../models/item.model");
const calculateRowWeight = require("../utilities/calculateRowWeight"); // Import the calculateRowWeight function from the utility module

let rowCapacity = 10000 // rowCapacity as a global variable

const itemController = {
  create: async (req, res) => {
    try {  
      // Create a new item using the request body
      const doc = new itemModel(req.body);

      // Convert the item name to lowercase
      doc.name = doc.name
      // Converts item name to lowercase
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z]/g, ' ')
      .replace(/\b(\w+)\b(?!\s)/g, '$1 ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s$/, '')
      .replace(/\s(\w+\b)$/, '$1')
      .replace(/^\s*(\w+\b)/, '$1');
    
      // Calculate the total weight of items in the row
      const rowWeight = await calculateRowWeight(doc.row_num);
    
      switch (true) {
        // Checks if no name is entered for item
        case doc.name === "":
          res.status(400).json({ status: "Please, enter item name" });
        break; 

        // Checks if item weight is less than 1 tonne
        case doc.weight < 1:
          res.status(400).json({ status: "Item weight cannot be less than 1 tonne" });
        break; 

        /* 
          Checks if row number is less than 1.
          Note: This validaton can be removed if a set of values starting from 1 
          is provided for Jack/users to select from
        */
        case doc.row_num < 1:
          res.status(400).json({ status: "Row number cannot be less than 1" });
        break;

        /* 
          Checks if row number is less than 1.
          Note: This validaton can be removed if a set of values ending at 25 
          is provided for Jack/users to select from
        */
        case doc.row_num > 25:
          res.status(400).json({ status: "Maximum number of rows exceeded (25 rows max)" });
        break;

        /* 
          Checks if production date is selected.
          Note: Date can be extracted from calendar
        */ 
        case doc.production_date === null || doc.production_date === undefined:
          res.status(400).json({ status: "Please enter production date" });
        break;   

        /* 
          Checks if expiry date is selected.
          Note: Date can be extracted from calendar
        */
        case doc.expiry_date === null || doc.expiry_date === undefined:
          res.status(400).json({ status: "Please enter expiry date" });
        break;

        // Checks if row capacity(10 tonnes/10,000kg) is exceeded
        case rowWeight + doc.weight > rowCapacity:
          res.status(400).json({ status: `Row number (${doc.row_num}) remaining storage space (${rowCapacity - rowWeight} tonnes) is less than ${doc.name} weight (${doc.weight} tonnes)` });
        break;

        // Checks if weight value or row value is numeric
        case isNaN(doc.weight) || isNaN(doc.row_num):
          res.status(400).json({ status: "Invalid value entered" });
        break;

        default:
        // Save new item to database if all checks are valid
        await doc.save();
        res.status(200).json({ status: `${doc.name} added successfully` });
      }
    } 
    catch (err) {
      /* Handles any errors that occur while adding item to database.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while inserting item" });
    }
  },
  
  // Get all items/objects from the database
  getall: async (req, res) => {
    try {
      // Fetch all items from database
      const items = await itemModel.find();
      res.status(200).json({ status: "Items retrieved successfully", items });
    } 
    catch (err) {
      /* Handles any errors that occur while fetching all items in database.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while retrieving all items" });
    }
  },
  
  // Get an item by its id from database
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
    } 
    catch (err) {
      /* Handles any errors that occur while getting item by id.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while retrieving item (by id)" });
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
    } 
    else {
      // Update the item details with the request body
      item.name = req.body.name
      // Converts item name to lowercase
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z]/g, ' ')
      .replace(/\b(\w+)\b(?!\s)/g, '$1 ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s$/, '')
      .replace(/\s(\w+\b)$/, '$1')
      .replace(/^\s*(\w+\b)/, '$1');

      item.weight = req.body.weight;
      item.row_num = req.body.row_num;
    
      // Calculate the total weight of items in the row
      const rowWeight = await calculateRowWeight(item.row_num);
  
      // Check if updated item details are valid
      switch (true) {
        // Checks if no name is entered for item
        case item.name === "":
          res.status(400).json({ status: "Please, enter item name" });
        break; 
    
        // Checks if item weight is less than 1 tonne
        case item.weight < 1:
          res.status(400).json({ status: "Item weight cannot be less than 1 tonne" });
        break;
    
        /* 
          Checks if row number is less than 1.
          Note: This validaton can be removed if a set of values starting from 1 
          is provided for Jack/users to select from
        */
        case item.row_num < 1:
          res.status(400).json({ status: "Row number cannot be less than 1" });
        break;

        /* 
          Checks if row number is less than 1.
          Note: This validaton can be removed if a set of values starting from 1. 
          is provided for Jack/users to select from
        */
        case item.row_num < 1:
          res.status(400).json({ status: "Row number cannot be less than 1" });
        break;

        /* 
          Checks if row number is less than 1.
          Note: This validaton can be removed if a set of values ending at 25 
          is provided for Jack/users to select from
        */
        case item.row_num > 25:
          res.status(400).json({ status: "Maximum number of rows exceeded (25 rows max)" });
        break;

        /* 
          Checks if production date is selected.
          Note: Date can be extracted from calendar
        */ 
        case item.production_date === null || item.production_date === undefined:
          res.status(400).json({ status: "Please enter production date" });
        break;   

        /* 
          Checks if expiry date is selected.
          Note: Date can be extracted from calendar
        */
        case item.expiry_date === null || item.expiry_date === undefined:
          res.status(400).json({ status: "Please enter expiry date" });
        break;

        // Checks if row capacity(10 tonnes/10,000kg) is exceeded
        case rowWeight + item.weight > rowCapacity:
          res.status(400).json({ status: `Row number (${item.row_num}) remaining storage space (${rowCapacity - rowWeight} tonnes) is less than ${item.name} weight (${item.weight} tonnes)` });
        break;

        // Checks if weight value or row value is numeric
        case isNaN(item.weight) || isNaN(item.row_num):
          res.status(400).json({ status: "Invalid value entered" });
        break;

        default:
        // Save new item to database if all checks are valid
        await item.save();
        res.status(200).json({ status: `${item.name} updated successfully` });
      }
    }
    } catch (err) {
      /* Handles any errors that occur while updating item.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.Message });
      // res.status(400).json({ status: "Error occurred while updating item" });
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

    } 
    catch (err) {
      /* Handles any errors that occur while deleting item.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while deleting item" });
    }
  },

  // Get the total weight of all items in warehouse
  getTotalWeight: async (req, res) => {
    try {
    // Find all items in warehouse
    const items = await itemModel.find();
    
    // Calculate the total weight by summing the weight of each item
    const totalWeight = items.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);
    
    res.status(200).json({ status: "Total weight of all inventory retrieved successfully", totalWeight });
    } catch (err) {
      /* Handles any errors that occur while getting total weight of items in warehouse.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.Message });
      // res.status(400).json({ status: "Error occurred while retrieving item" });
    }
  },

  // Get average weight of items in a specified row
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

        // res.status(200).json({ status: "Average weight retrieved successfully", averageWeight });
        res.status(200).json({ status: `Average weight of row ${rowNum} items retrieved successfully`, averageWeight });
      }
    } catch (err) {
      /* Handles any errors that occur while getting average weight of items in a row.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.Message });
      // res.status(400).json({ status: "Error occurred while getting average row weight" });
    }
  },

  // Get list of empty row(s)
  getEmptyRows: async (req, res) => {
    try {
    // Find all items in warehouse/database
    const items = await itemModel.find();
    
    // Get list of all rows with item(s)
    const rowsWithItems = items.map(item => item.row_num);
    
    // Get list of all rows in warehouse/database
    const allRows = [...Array(25).keys()].map(rowNum => rowNum + 1);
    
    // Find empty rows
    const emptyRows = allRows.filter(row => !rowsWithItems.includes(row));
    
    res.status(200).json({ status: "Empty rows retrieved successfully", emptyRows });
    } catch (err) {
      /* Handles any errors that occur while updating item.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while generating list of empty rows" });
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

      // res.status(200).json({ status: "Row capacity retrieved successfully", remainingCapacity });
      res.status(200).json({ status: "Row capacity retrieved successfully", 
      remainingCapacity: `${remainingCapacity}kg` });

    } 
    catch (err) {
      /* Handles any errors that occur while getting the remaining storage space of a specified row.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err. Message });
      // res.status(400).json({ status: "Error occurred while getting remaining row capacity" });
    }
  },

  // Get list of all items in a row
  getItemsInRow: async (req, res) => {
    try {
      // Get the row number from the request parameters
      const rowNum = req.params.row;

      // Find all items in a specified row
      const items = await itemModel.find({ row_num: rowNum });

      // If there are no items in the row, return a 400 response
      if (items.length === 0) {
        res.status(400).json({ status: "This row is empty" });
      } else {
        // If there are items in the row, return them in the response
        res.status(200).json({ status: "Items retrieved successfully", items });
      }
    } 
    catch (err) {
      /* Handles any errors that occur while generating list of items in a row.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while generating list of items in row" });
    }
  },

  // Method for finding items with same word in their names
  getbyname: async (req, res) => {
    try {

      // Get the name from the request parameters
      const name = req.params.name
        // Converts item name to lowercase
        .toLowerCase()
        // Removes leading and trailing whitespace from item name
        .trim()
        // Removes all whitespace within item name (i.e. extra spaces between letters)
        .replace(/\s+/g, '')
        // Removes all special characters from item name
        .replace(/[^\w\s]/gi, '')
        // Adds a space between each word in item name // not working yet
        .replace(/\b(\w+)\b/g, '$1 ')
        // Replaces multiple spaces with a single space
        .replace(/\s{2,}/g, ' '
      );

      // Find items with names that contain the provided name
      const items = await itemModel.find({ name: { $regex: name } });

      if (items.length === 0) {
        // If no items were found, return a 400 response
        res.status(400).json({ status: "No items found with the specified name" });
      } else {
        // Return the found items in the response
        res.status(200).json({ status: "Items retrieved by name successfully", items });
      }

    } 
    catch (err) {
      /* Handles any errors that occur while finding item(s).
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while finding item(s)" });
    }
  },

  // Method for finding items that are halfway to being expired
  findExpiringItems: async (req, res) => {
    try {
      // Retrieve all items from the database
      const items = await itemModel.find();

      // Initialize an empty array to store expiring items
      const expiringItems = [];

      // Loop through the items
      for (const item of items) {
        // Calculate the shelf life of the item
        const shelfLife = item.expiry_date - item.production_date;

        // Calculate the current shelf life of the item
        const currentShelfLife = new Date() - item.production_date;

        // If the current shelf life of the item is greater than or equal to 50% of its shelf life, add it to the expiringItems array
        if (currentShelfLife / shelfLife >= 0.5) {
          expiringItems.push(item);
        }
      }

      // Send a 200 OK response with the expiring items
      res.status(200).json({ status: "Expiring Item(s):", expiringItems });

    } 
    catch (err) 
    {
      /* Handles any errors that occur while finding items about to expire.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while finding item(s) about to expire" });
      // console.error(err);
    }
  }

};

module.exports = itemController;
