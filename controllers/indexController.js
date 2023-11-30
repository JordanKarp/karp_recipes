const Recipe = require("../models/recipe");
const Category = require("../models/category");

const asyncHandler = require("express-async-handler");


exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numRecipies,
    numCategories,
  ] = await Promise.all([
    Recipe.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Karp Family Recipes",
    recipe_count: numRecipies,
    category_count: numCategories,
  });
});
