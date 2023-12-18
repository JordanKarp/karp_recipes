const express = require("express");
const router = express.Router();

// Require controller modules.
const category_controller = require("../controllers/categoryController");
const recipe_controller = require("../controllers/recipeController");
const tag_controller = require("../controllers/tagController");



/// Category ROUTES ///
// GET category home page.
router.get("/category", category_controller.index);

// GET request for creating a category. NOTE This must come before routes that display category (uses id).
router.get("/category/create", category_controller.category_create_get);

// POST request for creating category.
router.post("/category/create", category_controller.category_create_post);

// GET request to delete category.
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request to delete category.
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request to update category.
router.get("/category/:id/update", category_controller.category_update_get);

// POST request to update category.
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one category.
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all category items.
router.get("/categories", category_controller.category_list);


/// Recipe ROUTES ///

// GET recipe home page.
router.get("/recipe", recipe_controller.index);

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

// GET request to add a comment to this recipe.
router.get("/recipe/:id/comment", recipe_controller.recipe_comment_get);

// POST request to add a comment to this recipe.
router.post("/recipe/:id/comment", recipe_controller.recipe_comment_post);

// GET request for one recipe.
router.get("/recipe/:id", recipe_controller.recipe_detail);

// GET request for list of all recipe items.
router.get("/recipes", recipe_controller.recipe_list);

// GET request for list of all recipe items under a certain letter.

router.get("/recipes/:letter([a-zA-Z])", recipe_controller.recipe_list_letter);


/// Tag ROUTES ///
// GET tag home page.
router.get("/tag", tag_controller.index);

// GET request for creating a tag. NOTE This must come before routes that display tag (uses id).
router.get("/tag/create", tag_controller.tag_create_get);

// POST request for creating tag.
router.post("/tag/create", tag_controller.tag_create_post);

// GET request to delete tag.
router.get("/tag/:id/delete", tag_controller.tag_delete_get);

// POST request to delete tag.
router.post("/tag/:id/delete", tag_controller.tag_delete_post);

// GET request to update tag.
router.get("/tag/:id/update", tag_controller.tag_update_get);

// POST request to update tag.
router.post("/tag/:id/update", tag_controller.tag_update_post);

// GET request for one tag.
router.get("/tag/:id", tag_controller.tag_detail);

// GET request for list of all tag items.
router.get("/tags", tag_controller.tag_list);

module.exports = router;
