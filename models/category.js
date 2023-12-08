const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 50 },
  description: { type: String, maxLength: 200 },
});


CategorySchema.virtual("url").get(function () {
  return `/data/category/${this._id}`;
});

CategorySchema.index({ name: 'text', description: 'text'});

module.exports = mongoose.model("Category", CategorySchema);