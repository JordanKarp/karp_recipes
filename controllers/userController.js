const User = require("../models/user");
const Change = require("../models/change");

const passport = require('passport')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const { isAuth } = require("../config/authMiddleware");


// Display list of all Users.
exports.user_list = [
  isAuth,
  asyncHandler(async(req,res, next) => {
    const allUsers = await User.find().sort({ username: 1 }).exec();
    res.render("user_list", {
      title: "User List",
      user_list: allUsers,
      user: req.user || ''
    });
  })];

// Display detail page for a specific User.
exports.user_detail = [
  isAuth,
  asyncHandler(async (req, res, next) => {
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
  })];
  

  // Display Users delete form on GET.
exports.user_delete_get = [
  isAuth,
  asyncHandler(async (req, res, next) => {
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
})];


// Handle User delete on POST.
exports.user_delete_post = [
  isAuth,
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).exec()
    const change = new Change({
      user: req.user.username, 
      docType: 'User',
      doc: user.username,
      changeType: 'delete'
    });
    await change.save()
    await User.deleteOne({_id: req.params.id}).exec();
    if (user === req.user) {
      this.logout()
      res.redirect("/");
    }
    else {
      res.redirect("/user/all");
    }
})];


