const express = require("express");
const router = express.Router();

// Require controller modules.
const recipe_controller = require("../controllers/recipeController");

/// Recipe ROUTES ///

// GET catalog home page.
router.get("/", recipe_controller.index);

// GET request for creating a recipe. NOTE This must come before routes that display recipe (uses id).
router.get("/recipe/create", recipe_controller.recipe_create_get);

// POST request for creating recipe.
router.post("/recipe/create", recipe_controller.recipe_create_post);

// GET request to delete recipe.
router.get("/recipe/:id/delete", recipe_controller.recipe_delete_get);

// POST request to delete recipe.
router.post("/recipe/:id/delete", recipe_controller.recipe_delete_post);

// GET request to update recipe.
router.get("/recipe/:id/update", recipe_controller.recipe_update_get);

// POST request to update recipe.
router.post("/recipe/:id/update", recipe_controller.recipe_update_post);

// GET request for one recipe.
router.get("/recipe/:id", recipe_controller.recipe_detail);

// GET request for list of all recipe items.
router.get("/recipes", recipe_controller.recipe_list);