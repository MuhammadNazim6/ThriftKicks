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
  houseName:{
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



const cartSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  products: [
      {
        productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product', 
              required: true
          },
          quantity: {
              type: Number,
              default: 1,
              min: 1,
              max: 10
          }
      }
  ],
  createdAt: {
      type: Date,
      default: Date.now,
      required: true
  },
  updatedAt: {
      type: Date,
      default: Date.now,
      required: true
  }
});


// wishlist 
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});




const User = mongoose.model("User", userSchema);
const Address = mongoose.model("Address", addressSchema);
const Cart = mongoose.model("Cart",cartSchema)
const Wishlist = mongoose.model("Wishlist",wishlistSchema)



module.exports = {
  User,
  Address,
  Cart,
  Wishlist

};
