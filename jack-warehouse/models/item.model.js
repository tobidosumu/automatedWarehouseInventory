const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    min: 1,
    max: 10000,
  },
  row_num: {
    type: Number,
    min: 1,
    max: 25,
  },
  row_weight: {
    type: Number,
    min: 1,
    max: 10000,
  },
  expiry_date: {
    type: Date,
  },
  production_date: {
    type: Date,
  }
},

{ timestamps: true }

);

const Items = mongoose.model("Items", ItemSchema);

module.exports = Items;