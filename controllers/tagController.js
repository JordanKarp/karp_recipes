// const Tag = require("../models/tag");
const Recipe = require("../models/recipe");
const Tag = require("../models/tag");
const Change = require("../models/change");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const { isAuth } = require("../config/authMiddleware");

const TAG_GROUPS = ['Region', 'Cusine Type','Taste', 'Flavor','Meal and Menu', 'Equipment', 'Ingredient', 'Other']


// Redirects home
exports.index = asyncHandler(async (req, res, next) => {
    res.redirect('/data/tags')
  });

// Display list of all Tags.
exports.tag_list = asyncHandler(async (req, res, next) => {
    const allTags = await Tag.find()
      .sort({ group: 1, name: 1 })
      .exec();
    res.render("tag_list", { 
      title: "Tag List", 
      tag_list: allTags,
      user: req.user || '',
    });
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
        user: req.user || ''
    });
});

// Display tag create form on GET.
exports.tag_create_get = [
  isAuth,
  (req, res, next) => {
    res.render("tag_form", { 
      title: "Create New Tag", 
      groups: TAG_GROUPS,
      user: req.user || '',
   });
}];

// Handle tag create on POST.
exports.tag_create_post = [
  isAuth,
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
              user: req.user || '',
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
              const change = new Change({
                user: req.user.username, 
                docType: 'Tag',
                doc: tag.name,
                changeType: 'create'
              });
              await change.save()
              // New tag saved. Redirect to tag detail page.
              res.redirect(tag.url);
          }
      }
  }),
];

// Display tag delete form on GET.
exports.tag_delete_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [tag, allRecipiesInTag] = await Promise.all([
      Tag.findById(req.params.id).exec(),
      Recipe.find({ tags: req.params.id }, "title").exec(),
    ]);

    if (tag === null) {
      // No results.
      res.redirect("/data/tags");
    }

    res.render("tag_delete", {
      title: "Delete Tag",
      tag: tag,
      tag_recipies: allRecipiesInTag,
      user: req.user || '',
    });
  })];

// Handle tag delete on POST.
exports.tag_delete_post = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    // Get details of author and all their recipies (in parallel)
    const tag = await Tag.findById(req.params.id).exec();

    // Delete object and redirect to the list of tags.
    await Tag.findByIdAndDelete(req.body.tagid);

    const change = new Change({
      user: req.user.username, 
      docType: 'Tag',
      doc: tag.name,
      changeType: 'delete'
    });
    await change.save()
    res.redirect("/data/tags");

  })];

// Display tag update form on GET.
exports.tag_update_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
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
      user: req.user || '',
    });
  })];

// Handle tag update on POST.
exports.tag_update_post = [
  isAuth,
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
            const change = new Change({
              user: req.user.username, 
              docType: 'Tag',
              doc: updatedTag.name,
              changeType: 'update'
            });
            await change.save()
            
            // Redirect to book detail page.
            res.redirect(updatedTag.url);
    }
 }),
];
