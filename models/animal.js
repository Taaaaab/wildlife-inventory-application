const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AnimalSchema = new Schema({
  name: { type: String, required: true },
  binomial: { type: String, required: true },
  description: { type: String, required: true },
  animalclass: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  order: [{ type: Schema.Types.ObjectId, ref: "Order", required: true }],
  img: { type: String, required: true },
});

// Virtual for book's URL
AnimalSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/wildlife/animal/${this._id}`;
});

// Export model
module.exports = mongoose.model("Animal", AnimalSchema);

