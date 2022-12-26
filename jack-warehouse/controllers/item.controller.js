const itemModel = require("../models/item.model");

const itemController = {
  create: async (req, res) => {
    // Set the response header
    // res.set('Content-Type', 'application/json');
    
    const doc = new itemModel(req.body);
    await doc.save((err, data) => {
      console.log(err, data);
      if (err) {
        res.status(400).json({ status: "error trying to create item" });
      } else {
        res.status(200).json({ status: "item added successfully", data });
      }
    });
    res.status(200).json({ status: "item added successfully" });
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
