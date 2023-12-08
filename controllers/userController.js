const User = require("../models/user");

const passport = require('passport')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");



// Display list of all Users.
exports.user_list = asyncHandler(async(req,res, next) => {
    const allUsers = await User.find().sort({ username: 1 }).exec();
    res.render("user_list", {
      title: "User List",
      user_list: allUsers,
      user: req.user || ''
    });
  });

// Display detail page for a specific User.
exports.user_detail = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).exec();
  
    if (user === null) {
      // No results.
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("user_detail", {
      title: "User Detail",
      selected_user: user,
      user: req.user || ''
    });
  });
  

  // Display Users delete form on GET.
exports.user_delete_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec()
  if (user === null) {
      // No results.
      res.redirect("/users");
    }
    res.render("user_delete", {
      title: "Delete user",
      selected_user: user,
      user: req.user,
    });
});


// Handle User delete on POST.
exports.user_delete_post = asyncHandler(async (req, res, next) => {
    const user = await User.deleteOne({_id: req.params.id}).exec();
    if (user === req.user) {
      this.logout()
      res.redirect("/login");
    }
    else {
      res.redirect("/user/all");
    }
});


