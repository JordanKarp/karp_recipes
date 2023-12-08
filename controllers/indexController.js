const Recipe = require("../models/recipe");
const Category = require("../models/category");
const Tag = require("../models/tag");
const User = require("../models/user");

const passport = require('passport')
const asyncHandler = require("express-async-handler");
const { genPassword } = require("../config/passwordUtils");


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
    user: req.user || ''
  });
});


exports.search = asyncHandler(async (req, res, next) => {
  const searchTerm = req.body.search
  const allResults = await Recipe.find({ $text : { $search : searchTerm } }).sort({ title: 1 })
  res.render("search_results", {
    title: "Search Results",
    search_term: searchTerm,
    results: allResults
  });
});





exports.login = passport.authenticate('local', {
  failureMessage: true,
  failureRedirect: 'login',
  successRedirect: '/'
});

exports.logout =(req,res, next) => {
  req.logout(function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
};


exports.register = asyncHandler( async(req, res, next) => {
  const saltHash = genPassword(req.body.password);
  const {salt, hash} = saltHash;

  const newUser = new User({
      username:req.body.username,
      hash: hash,
      salt: salt,
  });

  await newUser.save()
  req.login(newUser, function(err) {
    if (err) { return next(err); }
    return res.redirect('/');
  });
});