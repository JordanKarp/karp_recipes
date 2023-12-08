const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  title: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category"},
  serves: { type: String },
  ingredients: { type: String, required: true },
  directions: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});


// Virtual for book's URL
RecipeSchema.virtual("url").get(function () {
  return `/data/recipe/${this._id}`;
})

RecipeSchema.index({ title: 'text', serves: 'text', ingredients: 'text', directions:'text' });

// Export model
module.exports = mongoose.model("Recipe", RecipeSchema);
