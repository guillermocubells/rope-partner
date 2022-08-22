const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  // let isLoggedIn = false;
  // if (req.session.user) {
  //   isLoggedIn = true;
  // }
  res.render("homepage");
});

module.exports = router;
