const mongoose = require('mongoose');

// Load models
require('../models/User');

// Set up connection event listeners for better connection state management
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/myBlog?authSource=admin';

  try {
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // Increased timeout for slower systems
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        socketTimeoutMS: 45000, // How long to wait for socket operations
      });
    } else {
      console.log('MongoDB already connected, state:', mongoose.connection.readyState);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
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
