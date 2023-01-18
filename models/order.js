const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
});

// Virtual for order's URL
OrderSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/wildlife/order/${this._id}`;
});

// Export model
module.exports = mongoose.model("Order", OrderSchema);

