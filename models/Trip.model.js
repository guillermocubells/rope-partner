const { Schema, model } = require("mongoose");
const { Types } = require("mongoose");

const tripSchema = new Schema(
  {
    // These are required, maybe here we can change some stuff related to the user name
    location: {
      type: String,
      required: true,
    },
    activity_type: {
      type: String,
      enum: ["Climbing", "Alpinism", "Canyoning"],
      required: true,
      // I think here you can add somehow default values, check the recipe thing
    },
    level: {
      type: String,
      required: true,
      enum: ["Rookie", "Intermediate", "Pro"],
    },
    spaces: {
      type: Number,
      min: 0,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Maybe for later to display which participants are in a specific trup
    // participants: [
    //   {
    //     type: mongoose.Types.ObjectId,
    //     ref: "book",
    //   },
    // ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Trip = model("trip", tripSchema);

module.exports = Trip;
