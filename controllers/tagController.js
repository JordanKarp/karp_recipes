// const Tag = require("../models/tag");
const Recipe = require("../models/recipe");
const Tag = require("../models/tag");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const TAG_GROUPS = ['Region', 'Cusine Type', 'Flavor','Meal and Menu', 'Cooking Vessel', 'Ingredient', 'Other']


// Redirects home
exports.index = asyncHandler(async (req, res, next) => {
    res.redirect('/data/tags')
  });

// Display list of all Tags.
exports.tag_list = asyncHandler(async (req, res, next) => {
    const allTags = await Tag.find()
      .sort({ group: 1, name: 1 })
      .exec();
    res.render("tag_list", { title: "Tag List", tag_list: allTags });
});

// Display detail page for a specific tag.
exports.tag_detail = asyncHandler(async (req, res, next) => {
    const [tag, recipiesInTag] = await Promise.all([
        Tag.findById(req.params.id).exec(),
        Recipe.find({ tags: req.params.id }, "title").exec(),
    ]);
    if (tag === null) {
        // No results.
        const err = new Error("Tag not found");
        err.status = 404;
        return next(err);
    }

    res.render("tag_detail", {
        title: "Tag Detail",
        tag: tag,
        tag_recipes: recipiesInTag,
    });
});

// Display tag create form on GET.
exports.tag_create_get = (req, res, next) => {
    res.render("tag_form", { title: "Create New Tag", groups: TAG_GROUPS });
  };

// Handle tag create on POST.
exports.tag_create_post = [
    // Validate and sanitize the name field.
    body("name", "Tag name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 }),
    body("group")
        .trim(),
    body("description")
        .trim(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a tag object with escaped and trimmed data.
        const tag = new Tag({
             name: req.body.name, 
             group: req.body.group,
             description: req.body.description
        });

        if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
            res.render("tag_form", {
                title: "Create New Tag",
                tag: tag,
                errors: errors.array(),
            });
        return;
        } else {
            // Data from form is valid.
            // Check if tag with same name already exists.
            const tagExists = await Tag.findOne({ name: req.body.name })
                .collation({ locale: "en", strength: 2 })
                .exec();
            if (tagExists) {
                // Tag exists, redirect to its detail page.
                res.redirect(tagExists.url);
            } else {
                await tag.save();
                // New tag saved. Redirect to tag detail page.
                res.redirect(tag.url);
            }
        }
    }),
];

// Display tag delete form on GET.
exports.tag_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [tag, allRecipiesInTag] = await Promise.all([
      Tag.findById(req.params.id).exec(),
      Recipe.find({ tags: req.params.id }, "title").exec(),
    ]);

    if (tag === null) {
      // No results.
      res.redirect("/data/tags");
    }

    console.log(allRecipiesInTag)
    res.render("tag_delete", {
      title: "Delete Tag",
      tag: tag,
      tag_recipies: allRecipiesInTag,
    });
  });

// Handle tag delete on POST.
exports.tag_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of author and all their recipies (in parallel)
    const tag = await Tag.findById(req.params.id).exec();

    // Delete object and redirect to the list of tags.
    await Tag.findByIdAndDelete(req.body.tagid);
    res.redirect("/data/tags");

  });

// Display tag update form on GET.
exports.tag_update_get = asyncHandler(async (req, res, next) => {
    const tag = await Tag.findById(req.params.id).exec()

    if (tag === null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    res.render("tag_form", {
      title: "Update Tag",
      tag: tag,
      groups: TAG_GROUPS,
    });
  });

// Handle tag update on POST.
exports.tag_update_post = [
     // Validate and sanitize the name field.
    body("name", "Tag name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 }),
    body("description")
        .trim(),

 // Process request after validation and sanitization.
 asyncHandler(async (req, res, next) => {
     // Extract the validation errors from a request.
     const errors = validationResult(req);

     // Create a tag object with escaped and trimmed data.
     const tag = new Tag({
          name: req.body.name, 
          group: req.body.group,
          description: req.body.description,
          _id: req.params.id,
     });

     if (!errors.isEmpty()) {
     // There are errors. Render the form again with sanitized values/error messages.
         res.render("tag_form", {
             title: "Update Tag",
             tag: tag,
             groups: TAG_GROUPS,
             errors: errors.array(),
         });
     return;
     } else {
         // Data from form is valid.
               // Data from form is valid. Update the record.
            const updatedTag = await Tag.findByIdAndUpdate(req.params.id, tag, {});
            // Redirect to book detail page.
            res.redirect(updatedTag.url);
    }
 }),
];
