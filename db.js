const mongoose = require("mongoose");
require('dotenv').config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database: " + error);
  }
};

module.exports = connectToDatabase;
