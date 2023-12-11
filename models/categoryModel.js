const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  is_listed: {
    type: Boolean,
    default: true
  },
  offers: {
    type: Array
  }
  
});


const Category = mongoose.model("category",categorySchema);

module.exports = {
  Category
}