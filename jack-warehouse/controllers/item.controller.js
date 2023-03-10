const mongoose = require("mongoose");
const itemModel = require("../models/item.model"); // Import the Model from the model modulw
const calculateRowWeight = require("../utilities/calculateRowWeight"); // Import the calculateRowWeight function from the utility module
const batchNumGenerator = require("../utilities/batchNumGenerator");

let rowCapacity = 10000 // rowCapacity as a global variable

const itemController = {
  create: async (req, res) => {
    try {  
      let { name, weight, production_date, expiry_date, tag } = req.body;

      // Converts item name to lowercase, trim and replaces non-letter characters
      name = name.toLowerCase().trim().replace(/[^a-zA-Z]/g, ' ');
      tag = tag.toLowerCase().trim().replace(/[^a-zA-Z]/g, ' ');
  
      // Generate a batch number for the item
      const batchNum = batchNumGenerator(tag);
  
      // Check if an item with the same name already exists in the database
      const existingItem = await itemModel.findOne({ name });
  
      // Assign the row_num of the new item based on the following conditions:
      let rowNum;
      if (!existingItem) {
        // Find an empty row_num within the range of 1 to 25
        const emptyRowNumPromise = [];
        for (let i = 1; i <= 25; i++) {
          emptyRowNumPromise.push(calculateRowWeight(i));
        }
        const emptyRowNumData = await Promise.all(emptyRowNumPromise);
        let emptyRowNum;
        emptyRowNumData.find((value, index) => {
          if (value === 0) {
            emptyRowNum = index + 1;
            return true;
          }
        });
        rowNum = emptyRowNum;
      } else {
        // If an item with the same name exists, check if the row_num is full
        const rowWeight = await calculateRowWeight(existingItem.row_num);
  
        if (rowWeight + weight > rowCapacity) {
  
          // Find an empty row_num within the range of 1 to 25
          const emptyRowNumPromise = [];
          for (let i = 1; i <= 25; i++) {
            emptyRowNumPromise.push(calculateRowWeight(i));
          }
          const emptyRowNumData = await Promise.all(emptyRowNumPromise);
          let emptyRowNum;
          emptyRowNumData.find((value, index) => {
            if (value < rowCapacity) {
              emptyRowNum = index + 1;
              return true;
            }
          });
  
          // If no empty row_num is found, return an error message
          if (!emptyRowNum) {
            res.status(400).json({ status: "No empty row available" });
            return;
          }
          // Assign the new item the empty row_num
          rowNum = emptyRowNum;
        } else {
          // If the row_num is not full, assign the new item the same row_num as the existing item
          rowNum = existingItem.row_num;
        }
      }
  
      // Create a new item with the provided data and the assigned row_num
      const doc = new itemModel({
        name,
        weight,
        row_num: rowNum,
        production_date,
        expiry_date,
        tag,
        batchNum,
      });
  
      doc.name = doc.name
      .toLowerCase() // Converts item name to lowercase
      .trim()
      .replace(/[^a-zA-Z]/g, ' ');

      doc.tag = doc.tag
      .toLowerCase() // Converts tag name to lowercase
      .trim()
      .replace(/[^a-zA-Z]/g, ' ');

      // Calculate the total weight of items in the row
      const rowWeight = await calculateRowWeight(doc.row_num);

      switch (true) {
        // Checks if no name is entered for item
        case doc.name === "":
          res.status(400).json({ status: "Please, enter item name" });
        break; 

        // Checks if no tag is entered for item
        case doc.tag === "":
          res.status(400).json({ status: "Please, select a tag for this item"})
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

        // const remainingCapacity = rowCapacity - weight;
        const remainingCapacity = rowCapacity - (rowWeight + weight);
        
        doc.row_capacity = remainingCapacity;

        // console.log(remainingCapacity);
        // console.log(rowWeight + weight);
        // console.log(weight);

        // Save the new item with the remaining row_capacity to the database
        const savedItem = await doc.save();

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

      // Checks if there is an item in the database/warehouse
      if (Object.keys(items).length > 0) {
        res.status(200).json({ status: "All item(s) in the warehouse:", items });
      } else {
        // In the event that no item was found
        res.status(400).json({ status: "Warehouse is empty" });
      }
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
        res.status(400).json({ status: `Item with ID number (${objectId}) was not found` });
      } else {
        // If the item was found, return it in the response
        res.status(200).json({ status: `Item ID number (${objectId}) retrieved successfully`, item });
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
      res.status(400).json({ status: `Item with ID number (${objectId}) was not found` });
    } 
    else {
      // Update the item details with the request body
      item.name = req.body.name
      // Converts item name to lowercase
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z]/g, ' ')

      item.weight = req.body.weight;
      item.row_num = req.body.row_num;
      item.tag = req.body.tag;
      item.expiry_date = req.body.expiry_date;
      item.production_date = req.body.production_date;
    
      // Calculate the total weight of items in the row
      const rowWeight = await calculateRowWeight(item.row_num);
  
      // Check if updated item details are valid
      switch (true) {
        // Checks if no name is entered for item
        case item.name === "":
          res.status(400).json({ status: "Please, enter item name" });
        break; 
    
        // Checks if no tag is entered for item
        case item.tag === "":
          res.status(400).json({ status: "Please, enter item tag" });
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
        case item.expiry_date === null || item.expiry_date === undefined || item.expiry_date === "":
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
        res.status(400).json({ status: `Item with ID number (${objectId}) was not found` });
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
  getRowsTotalWeight: async (req, res) => {
    try {
    // Find all items in warehouse
    const items = await itemModel.find();
    
    // Calculate the total weight by summing the weight of each item
    const totalWeight = items.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);
    
    res.status(200).json({ status: `Total weight of all stocks is: (${totalWeight}kg)` });
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
  getRowAverageWeight: async (req, res) => {
    try {
      // Get the row number from the request parameters
      const rowNum = req.params.row;

      // Find all items in the specified row
      const items = await itemModel.find({ row_num: rowNum });

      if (items.length === 0) {
        res.status(200).json({ status: `Row number (${rowNum}) is empty` });
      } else {
        // Calculate the average weight by dividing the total weight by the number of items
        const totalWeight = items.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);
        const averageWeight = totalWeight / items.length;

        // res.status(200).json({ status: "Average weight retrieved successfully", averageWeight });
        res.status(200).json({ status: `Average weight of items in row number (${rowNum}) is: (${averageWeight}kg)` });
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
  getAllEmptyRows: async (req, res) => {
    try {
    // Find all items in warehouse/database
    const items = await itemModel.find();
    
    // Get list of all rows with item(s)
    const rowsWithItems = items.map(item => item.row_num);
    
    // Get list of all rows in warehouse/database
    const allRows = [...Array(25).keys()].map(rowNum => rowNum + 1);
    
    // Find empty rows
    const emptyRows = allRows.filter(row => !rowsWithItems.includes(row));

    if (Object.keys(emptyRows).length > 0) {
      // Sends a notification to Jack
      res.status(200).json({ status: "Empty row(s):", emptyRows });
      } else {
      // When no expiring item is found
      res.status(400).json({ status: "No empty row found. All rows are currently stocked. :)" });
    }

    } catch (err) {
      /* Handles any errors that occur while updating item.
        Note: I prefer to use this error-handling format during dev 
        as it provides useful debugging error message.
      */
      res.status(400).json({ error: err.message });
      // res.status(400).json({ status: "Error occurred while generating list of empty rows" });
    }
  },

  // Get the stock level of a specified row
  getRowStockLevel: async (req, res) => {
    try {
      // Get the row number from the request parameters
      const rowNum = req.params.row;

      switch (true) {
        // Check if the row number is not a number
        case isNaN(rowNum):
          res.status(400).json({ status: "Invalid entry" });
          break;

        // Check if the row number is less than 1
        case rowNum < 1:
          res.status(400).json({ status: "Row number cannot be less than 1" });
          break;

        // Check if the row number is greater than 25
        case rowNum > 25:
          res.status(400).json({ status: "Maximum number of rows exceeded (25 rows max)" });
          break;

        default:
          // Find all items in the specified row
          const items = await itemModel.find({ row_num: rowNum });

          // Calculate the total weight of items in the row
          const rowWeight = items.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);

          // Calculate the remaining capacity by subtracting the row weight from the row capacity
          const remainingCapacity = rowCapacity - rowWeight;

          // Check if the row is full to capacity
          if (remainingCapacity < 1) {
            res.status(400).json({ status: `Row number (${rowNum}) is full to capacity (${remainingCapacity}kg space left)` });
          } else {
            // Return the remaining capacity if the row is not full
            res.status(200).json({ status: `Row number (${rowNum}) is not full (can take ${remainingCapacity}kg) of items more` });
            // res.status(200).json({ status: "Row capacity retrieved successfully", remainingCapacity });
          }
      }
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
  getItemsByRowNum: async (req, res) => {
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
        res.status(200).json({ status: `Row (${rowNum}) items retrieved successfully`, items });
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
  getItemsByName: async (req, res) => {
    try {

      // Get the name from the request parameters
      const name = req.params.name
      // Converts item name to lowercase
      .toLowerCase()
      // Removes leading and trailing whitespace from item name
      .trim()
      // Accepts only lowercase and uppercase letters
      .replace(/[^a-zA-Z]/g, ' ')

      // Find items with names that contain the provided name
      const items = await itemModel.find({ name: { $regex: name } });

      if (items.length === 0) {
        // If no items were found, return a 400 response
        res.status(400).json({ status: `No item with the name (${name}) exists in the warehouse` });
      } else {
        // Return the found items in the response
        res.status(200).json({ status: `Items with the name (${name}) retrieved successfully`, items });
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

      // Checks if no expiring item(s) exist(s)
      if (Object.keys(expiringItems).length > 0) {
        // Sends a notification to Jack
        res.status(200).json({ status: "Expiring Item(s):", expiringItems });
        } else {
        // When no expiring item is found
        res.status(400).json({ status: "No item is about to expire. Everything fresh! :)" });
      }
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
  },

  // Method for getting items by tag
  getItemsByTag: async (req, res) => {
    try {
    // Get the tag from the request parameters
    const tag = req.params.tag.toLowerCase();
    console.log(tag);
    
    switch (true) {
      /* 
        Checks if the tag is not null, not defined or not empty, 
        Note: This case will not be necessary for production as the
        tags will have been validated before they are saved.
        Besides, the tags will be served as a list of dropdown 
        options to select from
      */
      case tag === null || tag === undefined || tag === "":
        res.status(400).json({ status: "Tag name cannot be null or undefined" });
        break;
      case tag === "":
        res.status(400).json({ status: "Tag name cannot be empty" });
        break;
      default:
        // Find items with the specified tag
        const items = await itemModel.find({ tag: tag });
    
        if (!items || items.length === 0) {
          // When items with the tag name are not found
          res.status(400).json({ status: `Sorry, no item(s) exist(s) by the tag name (${tag})` });
        } else {
          // Retrieves all items with the tag name
          res.status(200).json({ status: `Items tagged (${tag}) retrieved successfully`, items });
        }
    }
    } catch (error) {
    // Handle any errors that occur while querying the database
    console.error(error);
    res.status(400).json({ status: "Error occurred while getting items", error });
    }
  },    

  // Method for tracking rows running out of stock
  getRowsRunningOutOfStock: async (req, res) => {
    try {
      // Initialize an array to store the row numbers
      const rows = [];
  
      const halfCapacity = rowCapacity / 2; // The capacity of each row is 5,000kg (i.e. 5 tonnes)
  
      // Iterate through all rows from 1 to 25
      for (let rowNum = 1; rowNum <= 25; rowNum++) {
        // Calculate the total weight of items in the row
        const rowWeight = await calculateRowWeight(rowNum);
  
        // Calculate the remaining capacity by subtracting the row weight from the row capacity
        const remainingCapacity = rowCapacity - rowWeight;
  
        // Check if the remaining capacity is less than half of the row capacity
        if (remainingCapacity < halfCapacity) {
          // Add the row number to the array if the condition is met
          rows.push(rowNum);
        }
      }
  
      // Checks if number of row is more than 0  
      if (Object.keys(rows).length > 0) {
        // Return the array of row numbers
        res.status(200).json({ status: "Row(s) running out of stock - Jack restock or produce!:", rows });
      } else {
        // When no row(s) is found
        res.status(400).json({ status: "No row is running out of stock. No need for production now :)" });
      }
    } catch (error) {
      // Handle any errors that occur while querying the database
      res.status(400).json({ status: "Error occurred while getting rows with low capacity" });
    }
  }

};

module.exports = itemController;
