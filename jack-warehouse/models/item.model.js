const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: ""
  },
  weight: {
    type: Number,
    min: 1,
    max: 10000, // (kg)
    required: true,
    default: 0
  },
  row_num: {
    type: Number,
    min: 1,
    max: 25,
    required: true,
    default: 0
  },
  row_capacity: {
    type: Number,
    min: 0,
    max: 10000 // (kg)
  },
  tag: {
    type: String,
    required: true,
    default: ""
  },
  production_date: {
    type: Date,
    required: true,
    default: ""
  },
  expiry_date: {
    type: Date,
    required: true,
    default: ""
  },
  batchNum: {
    type: String,
    required: true
  }
},

{ timestamps: true }

);

const ItemModel = mongoose.model("inventory", ItemSchema);

module.exports = ItemModel;
