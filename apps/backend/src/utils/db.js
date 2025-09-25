const mongoose = require("mongoose");

// Load models
require("../models/User");

// Set up connection event listeners for better connection state management
mongoose.connection.on("connected", () => {
  // MongoDB connected successfully
});

mongoose.connection.on("disconnected", () => {
  // MongoDB disconnected
});

mongoose.connection.on("reconnected", () => {
  // MongoDB reconnected
});

mongoose.connection.on("error", (err) => {
  // MongoDB connection error occurred
});

const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb://root:example@localhost:27017/myBlog?authSource=admin";

  try {
    if (mongoose.connection.readyState === 0) {
      // 0 = disconnected
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // Increased timeout for slower systems
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        socketTimeoutMS: 45000, // How long to wait for socket operations
      });
    }
  } catch (err) {
    await mongoose.disconnect();
    throw err; // Re-throw the error
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { connectDB, disconnectDB };
