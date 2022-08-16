const { Schema, model } = require("mongoose");

const tripSchema = new Schema(
  {
    // These are required, maybe here we can change some stuff related to the user name
    location: {
      type: String,
      required: true,
    },
    activity_type: {
      type: String,
      required: true,
      // I think here you can add somehow default values, check the recipe thing
    },
    level: {
      type: String,
      required: true,
    },
    spaces: {
      type: Number,
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

const Trip = model("Trip", tripSchema);

module.exports = Trip;
