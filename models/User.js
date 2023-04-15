const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dufb4a9l1/image/upload/v1681555883/313202890_1243245032901597_8109913107223400890_n_xlpgv0.png",
    },
    roles: {
      type: [String],
      required: true,
      default: ["USER"],
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
