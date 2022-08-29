module.exports = (req, res, next) => {
    // checks if the user has that trip already on its trips
    if (req.params.tripid) {
      return res.redirect("/trip/all-trips");
    }
    
    req.user = req.session.user;
    next();
  };