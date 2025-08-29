const mongoose = require('mongoose');
const connectDB = require('./db');

// Use the same URI as the application for testing the connection utility
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myBlog';

beforeAll(async () => {
  // Ensure a clean state before all tests
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  // Attempt to connect to the actual MongoDB instance
  await mongoose.connect(MONGODB_URI);
});

afterAll(async () => {
  // Disconnect after all tests are done
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
});

// Clear the database before each test to ensure test isolation
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
});

describe('Database Connection', () => {
  it('should connect to MongoDB successfully', async () => {
    // Disconnect first to ensure connectDB establishes a new connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  it('should handle connection errors', async () => {
    // Disconnect any existing connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    // Mock mongoose.connect to throw an error
    const mockMongooseConnect = jest.spyOn(mongoose, 'connect').mockImplementation(() => {
      throw new Error('Mock connection error');
    });

    // Mock console.error to capture output
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(connectDB()).rejects.toThrow('Mock connection error');

    expect(mockConsoleError).toHaveBeenCalledWith('MongoDB connection error:', expect.any(Error));
    expect(mongoose.connection.readyState).toBe(0); // 0 means disconnected

    // Restore mocks
    mockMongooseConnect.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should disconnect from MongoDB', async () => {
    await connectDB(); // Ensure connected first
    await mongoose.disconnect();
    expect(mongoose.connection.readyState).toBe(0); // 0 means disconnected
  });
});
