const router = require("express").Router();
const User = require("../models/User.model");

router.get("/:userId", (req, res) => {
  // check if it is a valid ObjectId
  const isValidId = isValidObjectId(req.params.userId);

  if (!isValidId) {
    return res.redirect("/");
  }

  UserModel.findById(req.params.userId)
    .populate("booksRented")
    .then((possibleUser) => {
      if (!possibleUser) {
        return res.redirect("/");
      }

      console.log("possibleUser:", possibleUser.booksRented);
      res.render("user/personal", {
        user: possibleUser,
        userId: req.params.userId,
      });
    })
    .catch((err) => {
      console.log("err:", err);
      res.status(500).redirect("/");
    });
});

module.exports = userRouter;
