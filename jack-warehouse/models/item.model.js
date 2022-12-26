const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemsSchema = new Schema({
  item_name: {
    type: String,
    required: true,
  },
  item_weight: {
    type: Number,
  },
  counter_num: {
    type: Number,
  },
  row_num: {
    type: Number,
  },
  item_expiry_date: {
    type: Date,
  },
  item_production_date: {
    type: Date,
  }
});

const Items = mongoose.model("Items", ItemsSchema);

module.exports = Items;