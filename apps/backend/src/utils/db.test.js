const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./db');

describe('Database Connection', () => {
  afterEach(async () => {
    await disconnectDB();
  });

  it('should connect to MongoDB successfully', async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  it('should handle connection errors', async () => {
    // This test will fail if you have a local MongoDB running on port 9999.
    const originalUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://localhost:9999/nonexistentdb'; // Invalid URI

    await expect(connectDB()).rejects.toThrow();

    process.env.MONGODB_URI = originalUri;
  }, 20000);

  it('should disconnect from MongoDB', async () => {
    await connectDB(); // Ensure connected first
    await disconnectDB();
    expect(mongoose.connection.readyState).toBe(0); // 0 means disconnected
  });
});
