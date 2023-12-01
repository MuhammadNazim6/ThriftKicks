const mongoose = require("mongoose")

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  href:{
    type: String,
    required: true,
  },
  is_listed: {
    type: Boolean,
    default: true
  }
})


const Banner = mongoose.model("banner",bannerSchema);

module.exports = {
  Banner
}