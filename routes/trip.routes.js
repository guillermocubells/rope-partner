const router = require("express").Router();
const { isValidObjectId } = require("mongoose");
const Trip = require("../models/Trip.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", (req, res) => {
  Trip.find({}).then((trips) => {
    res.render("trip/all-trips", { trips });
  });
});
//Aqui puede que este parte del problema de los renders
router.get("/add", isLoggedIn, (req, res) => {
  res.render("trip/add-trip");
});

router.post("/add", isLoggedIn, (req, res) => {
  const { location, activity_type, level, spaces, description } = req.body;

  //   const authorArray = authors.split(",").map((author) => author.trim());

  //  Look in the book model for something that respects ALL of these properties

  Trip.create({
    location,
    activity_type,
    level,
    spaces,
    description,
  })
    .then((createdTrip) => {
      User.findByIdAndUpdate(
        req.session.userId,
        {
          $push: { tripsRented: createdTrip._id },
        },
        {
          new: true,
        }
      ).then((updatedUser) => {
        console.log("updatedUser:", updatedUser);
        res.render("trip/add-trip", { createdTrip });
      });
    })
    .catch((err) => {
      console.log("There was an error creating your trip", err);
      res.redirect("/");
    });
});

router.get("/:tripId", (req, res) => {
  const { tripId } = req.params;

  Trip.findById(tripId).then((trip) => {
    res.render("trip/single-trip", { trip });
  });
});

// bookRouter.get("/:bookId/request", isLoggedIn, (req, res) => {
//   res.render("book/request", { id: req.params.bookId });
// });

router.get("/:tripId/request", isLoggedIn, (req, res) => {
  const isValidTripId = isValidObjectId(req.params.tripId);

  if (!isValidTripId) {
    return res.status(404).redirect("/trip/all-trips");
  }

  router.findById(req.params.tripId).then((trip) => {
    if (!trip) {
      return res.status(404).redirect("/trip/all-trips");
    }

    if (trip.spaces < 1) {
      return res
        .status(400)
        .redirect(`/trip/${req.params.tripId}?error='fully booked'`);
    }

    Trip.findByIdAndUpdate(req.params.tripId, {
      $inc: { spaces: -1 },
    }).then((updatedTrip) => {
      User.findByIdAndUpdate(req.session.userId, {
        $push: { tripsRented: trip._id },
      }).then(() => {
        res.redirect(`/user/${req.session.userId}`);
      });
    });
  });
});

router.get("/:tripId/return", isLoggedIn, async (req, res) => {
  const { tripId } = req.params;
  const isValidTripId = isValidObjectId(tripId);

  if (!isValidTripId) {
    return res.status(404).redirect("/trip/all-trips");
  }

  const { userId } = req.session;

  const user = await User.findOne({
    _id: userId,
    $in: { tripsRented: tripId },
  });

  if (!user) {
    return res.status(400).redirect("/trip/all-trips");
  }

  await User.findByIdAndUpdate(userId, { $pull: { tripsRented: tripId } });

  await Trip.findByIdAndUpdate(tripId, { $inc: { spaces: 1 } });
  // const book = await BookModel.findById(bookId);

  // await BookModel.findByIdAndUpdate(bookId, { stock: book.stock + 1 });

  res.redirect(`/user/${userId}`);

  // UserModel.findOne({
  //   _id: req.session.userId,
  //   $in: { booksRented: req.params.bookId },
  // }).then((possibleUser) => {
  //   if (!possibleUser) {
  //     return res.status(400).redirect("/book/all");
  //   }

  //   UserModel.findByIdAndUpdate(possibleUser._id, {
  //     $pull: { booksRented: req.params.bookId },
  //   }).then(() => {
  //     BookModel.findById(req.params.bookId).then((book) => {
  //       BookModel.findByIdAndUpdate(book._id, { stock: book.stock + 1 });
  //     });
  //   });
  // });
});

module.exports = router;
