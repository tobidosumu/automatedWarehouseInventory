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
    default: 0
  },
  row_num: {
    type: Number,
    min: 1,
    max: 25,
    required: true,
    default: 0
  },
  row_weight: {
    type: Number,
    min: 1,
    max: 10000
  },
  tag: {
    type: String,
    required: true,
    default: "default-tag"
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
  }
},

{ timestamps: true }

);

const Items = mongoose.model("Items", ItemSchema);

module.exports = Items;
