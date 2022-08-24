const router = require("express").Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 15;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", isLoggedOut, (req, res) => {
  const { username, email, password } = req.body;
  // Checking if the user provides a username
  if (!username) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your username.",
      ...req.body,
    });
  }
  //Checking if the user provides an email
  if (!email) { 
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide an email.",
      ...req.body,
    });
  }
  // Checking if the user email has an @ symbol
  if (!email.includes("@")) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please add a valid email.",
      ...req.body,
    });
  }
  // Checking if the user password is more than 8 characters long
  if (password.length < 8) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 8 characters long.",
      ...req.body,
    });
  }

  //   ! This use case is using a regular expression to control for special characters and min length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  */

  // Search the database for a user with the username or email submitted
  User.findOne({ $or: [{ username }, { email }] }).then((found) => {
    // If the user is found, send the message username is taken
    if (found) {
      return res.status(400).render("auth/signup", {
        errorMessage: "Username or email already taken.",
        ...req.body,
      });
    }

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        // Create a user and save it in the database
        return User.create({
          username,
          email,
          password: hashedPassword,
        });
      })
      .then((user) => {
        // Bind the user to the session object
        req.session.user = user._id; // maybe userId
        // res.redirect("/");
        res.redirect(`/user/${user._id}`); // Need to figure out how to send to the homepage when created account
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).render("auth/signup", {
            errorMessage:
              "Username need to be unique. The username you chose is already in use.",
            ...req.body,
          });
        }
        return res
          .status(500)
          .render("auth/signup", { errorMessage: error.message, ...req.body });
      });
  });
});

router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).render("auth/login", {
      errorMessage: "Please provide your username.",
    });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 8) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 8 characters long.",
      ...req.body,
    });
  }

  // Should do some email validation somewhere here

  // Search the database for a user with the username submitted in the form
  User.findOne({ username })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res.status(400).render("auth/login", {
          errorMessage: "Wrong credentials.",
          ...req.body,
        });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).render("auth/login", {
            errorMessage: "Wrong credentials.",
            ...req.body,
          });
        }
        // req.session.user = user;
        req.session.user = user._id; // ! better and safer but in this case we saving the entire user object, maybe userId check latter
        return res.redirect(`/user/${user._id}`);
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("hello class");// borrando la cookie si hay algún error
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    res.redirect("/");
  });
});

module.exports = router;
