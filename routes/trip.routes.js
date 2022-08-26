const router = require("express").Router();
const { isValidObjectId } = require("mongoose");
const Trip = require("../models/Trip.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const {
  Types: { ObjectId },
} = require("mongoose");

// Getting all the trips
router.get("/all-trips", (req, res) => {
  Trip.find({}).then((trips) => {
    res.render("trip/all-trips", { trips });
  });
});

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
      //   console.log(req.session.user); Little bit of debuggin here
      User.findByIdAndUpdate(
        req.session.user,
        {
          $push: { tripsRented: createdTrip._id },
        },
        {
          new: true,
        }
      ).then((updatedUser) => {
        // console.log(req.session.user), some more debugging it ended up being the relationship held with the session
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

// Esta parte seguramente se pueda borrar
// router.get("/:tripId/request", isLoggedIn, (req, res) => {
//   res.render("trip/request", { id: req.params.tripId });
// });

router.get("/:tripId/request", isLoggedIn, (req, res) => {
  const isValidTripId = isValidObjectId(req.params.tripId);

  if (!isValidTripId) {
    return res.status(404).redirect("/trip/all-trips");
  }

  Trip.findById(req.params.tripId).then((trip) => {
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
      User.findByIdAndUpdate(req.session.user, {
        //maybe it is userId beaware
        $push: { tripsRented: trip._id },
      }).then(() => {
        res.redirect(`/user/${req.session.user}`); //maybe the userId can go here
      });
    });
  });
  //   console.log(req);
  console.log(req.params.tripId);
  console.log(req.session.user);
});

// // Acordarse de incluir el validor --> Logged In
router.get("/:tripId/cancel", isLoggedIn, async (req, res) => {
  //   console.log(req.params);
  const { tripId } = req.params;
  const isValidTripId = isValidObjectId(tripId);

  if (!isValidTripId) {
    return res.status(404).redirect("/trip/all-trips");
  }

  const { user } = req.session;

  const possibleUser = await User.findOne({
    _id: user,
    $in: { tripsRented: tripId },
  });

  //   console.log(tripId);
  //   console.log(userId);

  if (!possibleUser) {
    return res.status(400).redirect("/trip/all-trips");
  }

  await User.findByIdAndUpdate(user, {
    $pull: { tripsRented: tripId },
  });
  //maybe something here .to string check Andres videos
  // _id: { $ne: ObjectId(req.session.user) },
  //   console.log(ObjectId(tripId))
  await Trip.findByIdAndUpdate(tripId, { $inc: { spaces: 1 } });

  res.redirect(`/user/${user}`);

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
});

module.exports = router;
