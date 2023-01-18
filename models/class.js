const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
});

// Virtual for Class URL
ClassSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/wildlife/class/${this._id}`;
});

// Export model
module.exports = mongoose.model("Class", ClassSchema);
