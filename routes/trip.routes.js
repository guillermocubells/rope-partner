const router = require("express").Router();
const { isValidObjectId } = require("mongoose");
const Trip = require("../models/Trip.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");

// // Getting all the trips
// router.get("/", (req, res) => {
//   Trip.find({}).then((trips) => {
//     res.render("trip/all-trips", { trips });
//   });
// });

// Creating a trip -- Acordarse de incluir el validador --> Logged In
router.get("/add", isLoggedIn, (req, res) => {
  res.render("trip/add-trip");
});

// Acordarse de incluir el validor --> Logged In
router.post("/add", isLoggedIn, (req, res) => {
  const { location, activity_type, level, spaces, description } = req.body;
  //   console.log("hello");
  //   const authorArray = authors.split(",").map((author) => author.trim());

  Trip.create({
    location,
    activity_type,
    level,
    spaces,
    description,
  })
    // Un posible metodo
    // .then((createdTrip) => {
    //   res.render("trip/add-trip", { createdTrip });
    // })

    // Un posible segundo metodo que combina la creacion y la actualizacion
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
        // console.log("updatedUser:", updatedUser);
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
  //   Should add a .then and a catch for validation, later on
});

// bookRouter.get("/:bookId/request", isLoggedIn, (req, res) => {
//   res.render("book/request", { id: req.params.bookId });
// });

// Acordarse de incluir el validor --> Logged In
// router.get("/:tripId/request", (req, res) => {
//   const isValidTripId = isValidObjectId(req.params.tripId);

//   if (!isValidTripId) {
//     return res.status(404).redirect("/trip/all-trips");
//   }

//   router.findById(req.params.tripId).then((trip) => {
//     if (!trip) {
//       return res.status(404).redirect("/trip/all-trips");
//     }

//     if (trip.spaces < 1) {
//       return res
//         .status(400)
//         .redirect(`/trip/${req.params.tripId}?error='fully booked'`);
//     }

//     Trip.findByIdAndUpdate(req.params.tripId, {
//       $inc: { spaces: -1 },
//     }).then((updatedTrip) => {
//       User.findByIdAndUpdate(req.session.userId, {
//         $push: { tripsRented: trip._id },
//       }).then(() => {
//         res.redirect(`/user/${req.session.userId}`);
//       });
//     });
//   });
// });

// // Acordarse de incluir el validor --> Logged In
// router.get("/:tripId/return", async (req, res) => {
//   const { tripId } = req.params;
//   const isValidTripId = isValidObjectId(tripId);

//   if (!isValidTripId) {
//     return res.status(404).redirect("/trip/all-trips");
//   }

//   const { userId } = req.session;

//   const user = await User.findOne({
//     _id: userId,
//     $in: { tripsRented: tripId },
//   });

//   if (!user) {
//     return res.status(400).redirect("/trip/all-trips");
//   }

//   await User.findByIdAndUpdate(userId, { $pull: { tripsRented: tripId } });

//   await Trip.findByIdAndUpdate(tripId, { $inc: { spaces: 1 } });
//   // const book = await BookModel.findById(bookId);

//   // await BookModel.findByIdAndUpdate(bookId, { stock: book.stock + 1 });

//   res.redirect(`/user/${userId}`);

//   // UserModel.findOne({
//   //   _id: req.session.userId,
//   //   $in: { booksRented: req.params.bookId },
//   // }).then((possibleUser) => {
//   //   if (!possibleUser) {
//   //     return res.status(400).redirect("/book/all");
//   //   }

//   //   UserModel.findByIdAndUpdate(possibleUser._id, {
//   //     $pull: { booksRented: req.params.bookId },
//   //   }).then(() => {
//   //     BookModel.findById(req.params.bookId).then((book) => {
//   //       BookModel.findByIdAndUpdate(book._id, { stock: book.stock + 1 });
//   //     });
//   //   });
//   // });
// });

module.exports = router;
