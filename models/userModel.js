const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  fullname: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
  },
  country: {
    type: String,
  },
  pincode: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
});

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  // image: {
  //   type: String,
  //   required: true,
  // },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);
const Address = mongoose.model("Address", addressSchema);

module.exports = {
  User,
  Address,
};
