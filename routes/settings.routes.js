const router = require("express").Router();
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", isLoggedIn, (req, res) => {
  res.render("settings/home");
});

router.get("/update-user", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.user);
  //   console.log(req.session.user);
  //   console.log(user.username);
  console.log(user);

  if (!user) {
    return res.redirect("/");
  }
  //   (req.body = user), console.log(req.body);

  res.render("settings/update-user");
});

module.exports = router;
