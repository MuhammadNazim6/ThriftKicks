const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  comment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  actualPrice: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required:true
  },
  image: {
    data:Buffer,
    contentType: String,
    path1:String,
    path2:String,
    path3:String
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  offerPrice: {
    type: Number,
  },
  ratings: [ratingSchema], // An array of the Rating subdocument
  stock: {
    type: Number,
    
  },
  is_listed: {
    type: Boolean,
    default: true,
  }

});

const Product = mongoose.model("Product", productSchema);
const Rating = mongoose.model("Rating", ratingSchema);




module.exports = {
  Product,
  Rating,
};
