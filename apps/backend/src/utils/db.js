const mongoose = require('mongoose');
const { setConnected } = require('./connection-status');

// Load models
require('../models/User');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/myBlog?authSource=admin';

  try {
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // Increased timeout for slower systems
      });
      console.log('MongoDB connected successfully');
      // Set connection status
      setConnected(true);
    } else {
      console.log('MongoDB already connected, state:', mongoose.connection.readyState);
      // Ensure flag is set if already connected
      setConnected(true);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Reset connection flag on error
    setConnected(false);
    await mongoose.disconnect();
    throw err; // Re-throw the error
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB disconnected successfully');
    }
  } catch (err) {
    console.error('MongoDB disconnection error:', err);
    throw err;
  }
};

module.exports = { connectDB, disconnectDB };
