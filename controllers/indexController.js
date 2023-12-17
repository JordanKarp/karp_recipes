const Recipe = require("../models/recipe");
const Category = require("../models/category");
const Tag = require("../models/tag");
const User = require("../models/user");
const Change = require("../models/change");

const passport = require('passport')
const asyncHandler = require("express-async-handler");
const { genPassword } = require("../config/passwordUtils");

const { isAuth } = require("../config/authMiddleware");


exports.index = asyncHandler(async (req, res, next) => {
  let [
    numRecipes,
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
    recipe_count: numRecipes,
    category_count: numCategories,
    tag_count: numTags,
    recipe: randomRecipe[0],
    user: req.user || ''
  });
});


exports.search = asyncHandler(async (req, res, next) => {
  const searchTerm = req.body.search
  if (!searchTerm) return
  const allResults = await Recipe.find({ $text : { $search : searchTerm } }).sort({ title: 1 })
  res.render("search_results", {
    title: "Search Results",
    search_term: searchTerm,
    results: allResults,
    user: req.user || '',
  });
});


exports.changelog = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    const allChanges = await Change.find()
      .populate('user')
      .sort({ createdAt: -1 })
    res.render("changelog", {
      title: "Changelog",
      all_changes: allChanges,
      user: req.user || '',
    });
  })
];


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
      username: req.body.username,
      hash: hash,
      salt: salt,
  });

  await newUser.save()
  const change = new Change({
    user: newUser,
    docType: 'User',
    docName: newUser.username,
    changeType: 'created'
  });
  await change.save()
  req.login(newUser, function(err) {
    if (err) { return next(err); }
    return res.redirect('/');
  });
});