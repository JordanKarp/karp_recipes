const Recipe = require("../models/recipe");
const Category = require("../models/category");
const Tag = require("../models/tag");
const Change = require("../models/change");
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
    res.render("recipe_list", { 
      title: "Recipe List", 
      recipe_list: allRecipes,
      user: req.user || '',
   });
});

// Display detail page for a specific recipe.
exports.recipe_detail = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id)
      .populate('category')
      .populate('tags')
      .exec();
    if (recipe === null) {
      // No results.
      const err = new Error("Recipe not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("recipe_detail", {
      title: "Recipe:",
      recipe: recipe,
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
        user: req.user.username, 
        docType: 'Recipe',
        doc: recipe.title,
        changeType: 'create'
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
      user: req.user.username, 
      docType: 'Recipe',
      doc: recipe.title,
      changeType: 'delete'
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
          user: req.user.username, 
          docType: 'Recipe',
          doc: updatedRecipe.title,
          changeType: 'update'
        });
        await change.save()

        // Redirect to new recipe record.
        res.redirect(updatedRecipe.url);
      }
    }),
];