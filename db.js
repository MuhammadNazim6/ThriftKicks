const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce_management_system", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database: " + error);
  }
};

module.exports = connectToDatabase;
