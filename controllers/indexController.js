const Recipe = require("../models/recipe");
const Category = require("../models/category");
const Tag = require("../models/tag");

const asyncHandler = require("express-async-handler");


exports.index = asyncHandler(async (req, res, next) => {
  let [
    numRecipies,
    numCategories,
    numTags,
    randomRecipe
  ] = await Promise.all([
    Recipe.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
    Tag.countDocuments({}).exec(),
    // Recipe.aggregate([{ $sample: { size: 1 } }])
    Recipe.aggregate().sample(1).exec()
  ]);
 
  // add URL field, and populate category and tag info
  randomRecipe = randomRecipe.map(result => Recipe.hydrate(result));
  await Recipe.populate(randomRecipe, {path: "category tags"});

  res.render("index", {
    title: "Karp Family Recipes",
    recipe_count: numRecipies,
    category_count: numCategories,
    tag_count: numTags,
    recipe: randomRecipe[0],
  });
});


exports.search = asyncHandler(async (req, res, next) => {
  const searchTerm = req.body.search
  // db.test.createIndex({ "$**": "text" },{ name: "TextIndex" })
  const allResults = await Recipe.find({ $text : { $search : searchTerm } }).sort({ title: 1 })
  // const allResults = await Recipe.find({title: searchTerm})
  res.render("search_results", {
    title: "Search Results",
    search_term: searchTerm,
    results: allResults
  });
});