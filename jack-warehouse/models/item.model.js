const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const item = new Schema(
  {
    item_name: {
      required: true,
      type: String,
    },
  },
  { timestamps: true }
);

const userGroup = mongoose.model("UserGroup", UserGroupSchema);

module.exports = userGroup;
