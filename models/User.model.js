const { Schema, model } = require("mongoose");
const { Types } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    // These are required, maybe here we can change some stuff
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    // // Maybe for later to display which trips have they rented
    tripsRented: [
      {
        type: Types.ObjectId,
        ref: "trip",
      },
    ],
  }, 
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("user", userSchema);

module.exports = User;
