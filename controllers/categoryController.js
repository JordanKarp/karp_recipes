const Category = require("../models/category");
const Recipe = require("../models/recipe");
const Change = require("../models/change");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const { isAuth } = require("../config/authMiddleware");

// Redirects home
exports.index = asyncHandler(async (req, res, next) => {
    res.redirect('/data/categories')
  });

// Display list of all Cateories.
exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({ name: 1 }).sort({"_id":1}).exec()

    res.render("category_list", { 
        title: "Category List", 
        category_list: allCategories,
        user: req.user || ''
    });
});

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, recipiesInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Recipe.find({ category: req.params.id }, "title").exec(),
    ]);
    if (category === null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_detail", {
        title: "Category Detail",
        category: category,
        category_recipes: recipiesInCategory,
        user: req.user || ''
    });
});

// Display category create form on GET.
exports.category_create_get = [
    isAuth,
    (req, res, next) => {
    res.render("category_form", { 
      title: "Create New Category",
      user: req.user || ''
    });
  }];

// Handle category create on POST.
exports.category_create_post = [
    isAuth,
    // Validate and sanitize the name field.
    body("name", "Category name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 }),
    body("description")
        .trim(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        console.log(req.body.name)
        // Create a category object with escaped and trimmed data.
        const category = new Category({
             name: req.body.name,
             description: req.body.description
        });

        if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
            res.render("category_form", {
                title: "Create New Category",
                category: category,
                errors: errors.array(),
                user: req.user || ''
            });
        return;
        } else {
            // Data from form is valid.
            // Check if category with same name already exists.
            const categoryExists = await Category.findOne({ name: req.body.name })
                .collation({ locale: "en", strength: 2 })
                .exec();
            if (categoryExists) {
                // Category exists, redirect to its detail page.
                res.redirect(categoryExists.url);
            } else {
                await category.save();
                const change = new Change({
                  user: req.user, 
                  docType: 'Category',
                  docName: category.name,
                  changeType: 'created'
                });
                await change.save()
                // New category saved. Redirect to category detail page.
                res.redirect(category.url);
            }
        }
    }),
];



// Display category delete form on GET.
exports.category_delete_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [category, allRecipiesInCategory] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Recipe.find({ category: req.params.id }, "title").exec(),
    ]);

    if (category === null) {
      // No results.
      res.redirect("/data/categories");
    }

    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      category_recipies: allRecipiesInCategory,
      user: req.user || ''
    });
  })];

// Handle category delete on POST.
exports.category_delete_post = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    // Get details of author and all their recipies (in parallel)
    const [category, allRecipiesInCategory] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Recipe.find({ category: req.params.id }, "title").exec(),
    ]);

    if (allRecipiesInCategory.length > 0) {
      // Category has recipies. Render in same way as for GET route.
      res.render("category_delete", {
        title: "Delete Category",
        category: category,
        category_recipies: allRecipiesInCategory,
        user: req.user || ''
      });
      return;
    } else {
      // Category has no recipies. Delete object and redirect to the list of categorys.
      await Category.findByIdAndDelete(req.body.categoryid);
      const change = new Change({
        user: req.user, 
        docType: 'Category',
        docName: category.name,
        changeType: 'deleted'
      });
      await change.save()

      res.redirect("/data/categories");
    }
  })];

// Display category update form on GET.
exports.category_update_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec()

    if (category === null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    res.render("category_form", {
      title: "Update Category",
      category: category,
      user: req.user || ''
    });
  })];

// Handle category update on POST.
exports.category_update_post = [
  isAuth,
    // Validate and sanitize the name field.
  body("name", "Category name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 }),
  body("description")
      .trim(),

 // Process request after validation and sanitization.
 asyncHandler(async (req, res, next) => {
     // Extract the validation errors from a request.
     const errors = validationResult(req);

     // Create a category object with escaped and trimmed data.
     const category = new Category({
          name: req.body.name, 
          description: req.body.description,
          _id: req.params.id,
     });

     if (!errors.isEmpty()) {
     // There are errors. Render the form again with sanitized values/error messages.
         res.render("category_form", {
             title: "Update Category",
             category: category,
             errors: errors.array(),
             user: req.user || ''
         });
     return;
     } else {
         // Data from form is valid.
               // Data from form is valid. Update the record.
            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
            // Redirect to book detail page.
            const change = new Change({
              user: req.user, 
              docType: 'Category',
              docName: category.name,
              changeType: 'updated'
            });
            await change.save()
            res.redirect(updatedCategory.url);
    }
 }),
];
