const router = require("express").Router();
const User = require("../models/User.model");
const { isValidObjectId } = require("mongoose");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/:userId", isLoggedIn, (req, res) => {
  // check if it is a valid ObjectId
  const isValidId = isValidObjectId(req.params.userId);

  if (!isValidId) {
    return res.redirect("/");
  } 
  // Redirecting in case another user is logged in and wants to access your account
  if (req.session.user != req.params.userId) {
    return res.redirect("/");
  }

  User.findById(req.params.userId)
    //   .populate({ path: "tripsRented", model: User })
    .populate("tripsRented")
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }

      //console.log("user:", user.tripsRented);
      res.render("user/personal", {
        user: user,
        userId: req.params.userId,
      });
    })
    .catch((err) => {
      console.log("err:", err);
      res.status(500).redirect("/");
    });
});



module.exports = router;
