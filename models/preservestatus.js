const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PreserveStatusSchema = new Schema({
  animal: { type: Schema.Types.ObjectId, ref: "Animal", required: true }, // reference to the associated animal
  name: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Currently in preserve", "Currently not in preserve"],
    default: "Currently in preserve",
  },
  expected_back: { type: Date, default: Date.now },
});

// Virtual for bookinstance's URL
PreserveStatusSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/wildlife/preservestatus/${this._id}`;
});

PreserveStatusSchema.virtual("expected_back_formatted").get(function () {
  return DateTime.fromJSDate(this.expected_back).toLocaleString(DateTime.DATE_MED);
});

// Export model
module.exports = mongoose.model("PreserveStatus", PreserveStatusSchema);

