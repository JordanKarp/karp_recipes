var express = require('express');
var router = express.Router();

const index_controller = require("../controllers/indexController");


/* GET home page. */
router.get('/', index_controller.index);

// router.get("/data", function (req, res) {
//     res.redirect("/");
//   });

module.exports = router;
