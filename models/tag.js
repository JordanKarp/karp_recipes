const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TagSchema = new Schema({
  name: { type: String, required: true },
  group: { type: String, required: true },
  description: { type: String, required: false },
});

// Virtual for book's URL
TagSchema.virtual("url").get(function () {
  return `/data/tag/${this._id}`;
});

TagSchema.index({ TagSchema: 'text', group: 'text', description: 'text' });

// Export model
module.exports = mongoose.model("Tag", TagSchema);
