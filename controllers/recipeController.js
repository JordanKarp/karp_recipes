const Recipe = require("../models/recipe");
const Category = require("../models/category");
const Tag = require("../models/tag");
const Change = require("../models/change");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const { isAuth } = require("../config/authMiddleware");



exports.index = asyncHandler(async (req, res, next) => {
    res.redirect('/data/recipes');
  });

// Display list of all Recipes.
exports.recipe_list = asyncHandler(async (req, res, next) => {
    const allRecipes = await Recipe.find()
      .sort({ title: 1 })
      .populate('category')
      .exec();
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X','Y', 'Z']
    res.render("recipe_list", {
      title: "Recipe List", 
      recipe_list: allRecipes,
      alphabet: alphabet,
      user: req.user || '',
   });
});

// Display list of all Recipes by letter.
exports.recipe_list_letter = asyncHandler(async (req, res, next) => {
  var regex = new RegExp("^"+ req.params.letter);
  console.log(regex)
  const allRecipesLetter = await Recipe.find({"title": {$regex: regex, $options: 'i'}})
    .sort({ title: 1 })
    .populate('category')
    .exec();
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X','Y', 'Z']
  res.render("recipe_list", {
    title: "Recipe List", 
    recipe_list: allRecipesLetter,
    alphabet: alphabet,
    user: req.user || '',
 });
});

// Display detail page for a specific recipe.
exports.recipe_detail = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id)
      .populate('category')
      .populate('tags')
      .populate({
        path: 'comments',
        populate: { path:  'user', model: 'User' }
      })
      .exec();
    if (recipe === null) {
      // No results.
      const err = new Error("Recipe not found");
      err.status = 404;
      return next(err);
    }
    const ratingComments = recipe.comments.filter(comment => !!comment.rating)
    const rating = {
      value: ratingComments.reduce((total, next) => total + next.rating, 0) / ratingComments.length,
      count: ratingComments.length
    }


    res.render("recipe_detail", {
      title: "Recipe:",
      recipe: recipe,
      rating: rating,
      user: req.user || ''
    });
});

// Display recipe create form on GET.
exports.recipe_create_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    // Get all categories and tags, which we can use for adding to our recipe.
    const [allCategories, allTags] = await Promise.all([
      Category.find().sort({ name: 1 }).exec(),
      Tag.find().sort({ group: 1, name: 1 }).exec(),
    ]);
    res.render("recipe_form", { 
      title: "Create Recipe", 
      categories: allCategories,
      tags: allTags,
      user: req.user || '',
     });
})];

// Handle recipe create on POST.
exports.recipe_create_post = [
  isAuth,
  (req, res, next) => {
    if (!Array.isArray(req.body.tags)) {
      req.body.tags =
        typeof req.body.tags === "undefined" ? [] : [req.body.tags];
    }
    next();
  },


  // Validate and sanitize fields.
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title must be specified."),
  body("serves")
    .trim(),
  body("ingredients")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Ingredients must be specified."),
  body("directions")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Directions must be specified."),
  body("tags.*")
    .trim(),


  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Recipe object with escaped and trimmed data
    const recipe = new Recipe({
      title: req.body.title,
      category: req.body.category,
      serves: req.body.serves,
      ingredients: req.body.ingredients,
      directions: req.body.directions,
      tags: req.body.tags,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      const [allCategories, allTags] = await Promise.all([
        Category.find().sort({ name: 1 }).exec(),
        Tag.find().sort({ group: 1, name: 1 }).exec(),
      ]);

      // Mark our selected tags as checked.
      for (const tag of allTags) {
        if (recipe.tags.includes(tag._id)) {
          tag.checked = "true";
        }
      }

      res.render("recipe_form", {
          title: "Create Recipe",
          categories: allCategories,
          tags: allTags,
          recipe: recipe,
          errors: errors.array(),
          user: req.user || '',
      });
      return;
    } else {
      // Data from form is valid.

      // Save recipe.
      await recipe.save();
      const change = new Change({
        user: req.user, 
        docType: 'Recipe',
        docName: recipe.name,
        changeType: 'created'
      });
      await change.save()
      // Redirect to new recipe record.
      res.redirect(recipe.url);
    }
  }),
];

// Display recipe delete form on GET.
exports.recipe_delete_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id).exec();

    if (recipe === null) {
        // No results.
        res.redirect("/data/recipes");
    }

    res.render("recipe_delete", {
        title: "Delete Recipe",
        recipe: recipe,
        user: req.user || '',
    });
})];

// Handle recipe delete on POST.
exports.recipe_delete_post = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findByIdAndDelete(req.body.recipeid);
    const change = new Change({
      user: req.user, 
      docType: 'Recipe',
      docName: recipe.name,
      changeType: 'deleted'
    });
    await change.save()
    res.redirect("/data/recipes");
})];

// Display recipe update form on GET.
exports.recipe_update_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    const [recipe, allCategories, allTags] = await Promise.all([
      Recipe.findById(req.params.id).exec(),
      Category.find().sort({ name: 1 }).exec(),
      Tag.find().sort({ group: 1, name: 1 }).exec()
    ]);

    if (recipe === null) {
      // No results.
      const err = new Error("Recipe not found");
      err.status = 404;
      return next(err);
    }

    // Mark our selected tags as checked.
    for (const tag of allTags) {
      for (const recipe_tag of recipe.tags) {
        if (tag._id.toString() === recipe_tag._id.toString()) {
          tag.checked = "true";
        }
      }
    }

    res.render("recipe_form", {
      title: "Update Recipe",
      recipe: recipe,
      categories: allCategories,
      tags: allTags,
      user: req.user || '',
    });
})];

// Handle recipe update on POST.
exports.recipe_update_post = [
  isAuth,
  (req, res, next) => {
      if (!Array.isArray(req.body.tags)) {
        req.body.tags =
          typeof req.body.tags === "undefined" ? [] : [req.body.tags];
      }
      next();
    },

    // Validate and sanitize fields.
    body("title")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Title must be specified."),
    body("serves")
      .trim(),
    body("ingredients")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Ingredients must be specified."),
    body("directions")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Directions must be specified."),
    body("tags.*")
      .trim(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create Recipe object with escaped and trimmed data
      const recipe = new Recipe({
        title: req.body.title,
        category: req.body.category,
        serves: req.body.serves,
        ingredients: req.body.ingredients,
        directions: req.body.directions,
        tags: typeof req.body.tags === "undefined" ? [] : req.body.tags,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        const [allCategories, allTags] = await Promise.all([
          Category.find().sort({ name: 1 }).exec(),
          Tag.find().sort({ group: 1, name: 1 }).exec(),
        ]);

        // Mark our selected genres as checked.
        for (const tag of allTags) {
          if (recipe.tags.indexOf(tag._id) > -1) {
            tag.checked = "true";
          }
        }

        res.render("recipe_form", {
            title: "Update Recipe",
            categories: allCategories,
            tags: allTags,
            recipe: recipe,
            errors: errors.array(),
            user: req.user || '',
        });
        return;
      } else {
        // Data from form is valid.

        // Update recipe.
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, recipe, {})
        const change = new Change({
          user: req.user, 
          docType: 'Recipe',
          docName: updatedRecipe.name,
          changeType: 'updated'
        });
        await change.save()

        // Redirect to new recipe record.
        res.redirect(updatedRecipe.url);
      }
    }),
];

// Display recipe comment create form on GET.
exports.recipe_comment_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id).exec()
    
    if (recipe === null) {
      // No results.
      const err = new Error("Recipe not found");
      err.status = 404;
      return next(err);
    }

    res.render("comment_form", { 
      title: "Add Comment", 
      recipe: recipe,
      user: req.user || '',
     });
})];

// Handle recipe comment create on POST.
exports.recipe_comment_post = [
  isAuth,
  // Validate and sanitize fields.
  body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Comment may not be blank."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const recipe = await Recipe.findById(req.params.id).exec()
    // Create Recipe object with escaped and trimmed data
    const comment = new Comment({
      user: req.user,
      rating: Number(req.body.rating),
      content: req.body.content,
      recipe: recipe,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.

      res.render("comment_form", {
          title: "Add Comment",
          recipe: recipe,
          comment: comment,
          errors: errors.array(),
          user: req.user,
      });
      return;
    } else {
      // Data from form is valid.

      // Save recipe.
      const change = new Change({
        user: req.user,
        docType: 'Recipe',
        docName: recipe.title,
        changeType: 'commented on'
      });
      await comment.save();
      await recipe.comments.push(comment)
      await recipe.save();
      await change.save()
      // Redirect to new recipe record.
      res.redirect(recipe.url);
    }
  }),
];
