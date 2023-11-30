const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  title: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  ingredients: { type: String, required: true },
  directions: { type: String, required: true },
//   tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
});

// Virtual for book's URL
RecipeSchema.virtual("url").get(function () {
  return `/data/recipe/${this._id}`;
});

// Export model
module.exports = mongoose.model("Recipe", RecipeSchema);
