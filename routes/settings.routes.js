const router = require("express").Router();
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const {
  Types: { ObjectId },
} = require("mongoose");

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

  res.render("settings/update-user", { user });
});

router.post("/update-user", isLoggedIn, async (req, res) => {
  const { username = "", email = "" } = req.body;
  // Checking if the user provides a username
  if (!username) {
    return res.status(400).render("settings/update-user", {
      errorMessage: "Please provide your username.",
      ...req.body,
    });
  }
  //Checking if the user provides an email
  if (!email) {
    return res.status(400).render("settings/update-user", {
      errorMessage: "Please provide an email.",
      ...req.body,
    });
  }
  // Checking if the user email has an @ symbol
  if (!email.includes("@")) {
    return res.status(400).render("settings/update-user", {
      errorMessage: "Please add a valid email.",
      ...req.body,
    });
  }

  const aSingleUser = await User.findOne({
    $or: [{ username }, { email }],
    _id: { $ne: ObjectId(req.session.user) },
  });

  if (!aSingleUser) {
    await User.findByIdAndUpdate(req.session.user, { username, email });
    return res.redirect("/");
  }

  //NO can do  you have to update your user name or email because it is already taken
  res.status(400).render("settings/update-user", {
    errorMessage: "New credentials already taken, please try again",
  });
});

module.exports = router;
