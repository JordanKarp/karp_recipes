var express = require('express');
var router = express.Router();

const index_controller = require("../controllers/indexController");

/* GET home page. */
router.get('/', index_controller.index);


router.post('/search', index_controller.search);


router.get("/login",  function (req, res) {
    res.render('login');
});

router.post('/login', index_controller.login);


router.get('/logout', index_controller.logout);



router.get("/register", function (req, res) {
    res.render('register');
});

router.post('/register', index_controller.register);


module.exports = router;
