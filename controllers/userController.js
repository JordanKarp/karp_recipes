const User = require("../models/user");
const Change = require("../models/change");
const Comment = require("../models/comment");

const passport = require('passport')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const { isAuth, isCurrentUser } = require("../config/authMiddleware");


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
    const [user, userChanges, userComments] = await Promise.all([
      User.findById(req.params.id).exec(),
      Change.find({user: req.params.id})
        .populate('user')
        .sort({ createdAt: -1 })
        .exec(),
      Comment.find({user: req.params.id})
        .populate('recipe')
        .populate('user')
        .sort({ createdAt: -1 })
        .exec(),
    ]) 
  
    if (user === null) {
      // No results.
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    console.log(userComments)
    // console.log(req.params.id == req.user._id)
    res.render("user_detail", {
      title: "User Detail",
      selected_user: user,
      selected_user_comments: userComments,
      selected_user_changes: userChanges,
      user: req.user || '',
    });
  })];
  

  // Display Users delete form on GET.
exports.user_delete_get = [
  isAuth,
  (req, res, next) => {
    if (req.params.id == req.user._id) {
      next()
    } else {
      res.render('edit_error', {user: req.user || ''})
    }
  },
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
  (req, res, next) => {
    if (req.params.id == req.user._id) {
      next()
    } else {
      res.render('edit_error')
    }
  },
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).exec()
    const change = new Change({
      user: req.user, 
      docType: 'User',
      docName: String(user.name),
      changeType: 'deleted'
    });
    await change.save()

    await User.deleteOne({_id: req.params.id}).exec();
    if (user.equals(req.user)) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    }
    else {
      res.redirect("/user/all");
    }
})];


