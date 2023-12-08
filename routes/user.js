const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");


// GET request for list of all Users.
router.get("/all", user_controller.user_list);

// GET request for one User.
router.get("/:id", user_controller.user_detail);


// GET request to delete User.
router.get("/:id/delete", user_controller.user_delete_get);

// POST request to delete one User.
router.post("/:id/delete", user_controller.user_delete_post);

module.exports = router;
