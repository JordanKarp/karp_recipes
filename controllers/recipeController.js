const Recipe = require("../models/recipe");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


exports.index = asyncHandler(async (req, res, next) => {
    res.redirect('/recipies');
  });

// Display list of all Recipes.
exports.recipe_list = asyncHandler(async (req, res, next) => {
    const allRecipes = await Recipe.find()
      .sort({ title: 1 })
      .populate('category')
      .exec();
    res.render("recipe_list", { title: "Recipe List", recipe_list: allRecipes });
});

// Display detail page for a specific recipe.
exports.recipe_detail = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id)
      .populate('category')
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
    });
});

// Display recipe create form on GET.
exports.recipe_create_get = asyncHandler(async (req, res, next) => {
    // Get all authors and genres, which we can use for adding to our book.
    const allCategories = await Category.find().sort({ name: 1 }).exec();
    res.render("recipe_form", { title: "Create Recipe", categories: allCategories });
});

// Handle recipe create on POST.
exports.recipe_create_post = [
    // Validate and sanitize fields.
    body("title")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Title must be specified."),
    body("ingredients")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Ingredients must be specified."),
    body("directions")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Directions must be specified."),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create Recipe object with escaped and trimmed data
      const recipe = new Recipe({
        title: req.body.title,
        category: req.body.category,
        ingredients: req.body.ingredients,
        directions: req.body.directions,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        const allCategories = await Category.find().sort({ name: 1 }).exec();
        res.render("recipe_form", {
            title: "Create Recipe",
            categories: allCategories,
            recipe: recipe,
            errors: errors.array()
        });
        return;
      } else {
        // Data from form is valid.
  
        // Save recipe.
        await recipe.save();
        // Redirect to new recipe record.
        res.redirect(recipe.url);
      }
    }),
];

// Display recipe delete form on GET.
exports.recipe_delete_get = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id).exec();

    if (recipe === null) {
        // No results.
        res.redirect("/data/recipes");
    }

    res.render("recipe_delete", {
        title: "Delete Recipe",
        recipe: recipe,
    });
});

// Handle recipe delete on POST.
exports.recipe_delete_post = asyncHandler(async (req, res, next) => {
    await Recipe.findByIdAndDelete(req.body.recipeid);
    res.redirect("/data/recipes");
});

// Display recipe update form on GET.
exports.recipe_update_get = asyncHandler(async (req, res, next) => {
  const [recipe, allCategories] = await Promise.all([
    Recipe.findById(req.params.id).exec(),
    Category.find().sort({ name: 1 }).exec()
  ]);

  if (recipe === null) {
    // No results.
    const err = new Error("Recipe not found");
    err.status = 404;
    return next(err);
  }

  res.render("recipe_form", {
    title: "Update Recipe",
    recipe: recipe,
    categories: allCategories
  });
});

// Handle recipe update on POST.
exports.recipe_update_post = [
    // Validate and sanitize fields.
    body("title")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Title must be specified."),
    body("ingredients")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Ingredients must be specified."),
    body("directions")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Directions must be specified."),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create Recipe object with escaped and trimmed data
      const recipe = new Recipe({
        title: req.body.title,
        category: req.body.category,
        ingredients: req.body.ingredients,
        directions: req.body.directions,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        const allCategories = await Category.find().sort({ name: 1 }).exec();
        res.render("recipe_form", {
            title: "Update Recipe",
            categories: allCategories,
            recipe: recipe,
            errors: errors.array()
        });
        return;
      } else {
        // Data from form is valid.

        // Update recipe.
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, recipe, {})
        // Redirect to new recipe record.
        res.redirect(updatedRecipe.url);
      }
    }),
];