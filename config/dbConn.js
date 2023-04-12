const mongoose = require("mongoose");

const connectToDb = () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDb;
