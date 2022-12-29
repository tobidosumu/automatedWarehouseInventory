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
    max: 10000,
    required: true,
  },
  row_num: {
    type: Number,
    min: 1,
    max: 25,
    required: true,
  },
  row_weight: {
    type: Number,
    min: 1,
    max: 10000,
  },
  production_date: {
    type: Date,
    required: true,
    default: ""
  },
  expiry_date: {
    type: Date,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  }
},

{ timestamps: true }

);

const Items = mongoose.model("Items", ItemSchema);

module.exports = Items;
