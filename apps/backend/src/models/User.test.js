const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./User');

let mongoServer;

describe('User Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a user with hashed password', async () => {
    const userData = {
      username: 'testadmin',
      email: 'admin@test.com',
      passwordHash: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.username).toBe('testadmin');
    expect(savedUser.email).toBe('admin@test.com');
    expect(savedUser.passwordHash).not.toBe('password123'); // Should be hashed
    expect(savedUser.role).toBe('admin');
  });

  it('should compare password correctly', async () => {
    const userData = {
      username: 'testadmin2',
      email: 'admin2@test.com',
      passwordHash: 'password123'
    };

    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should enforce unique username', async () => {
    const userData1 = {
      username: 'uniqueuser',
      email: 'user1@test.com',
      passwordHash: 'password123'
    };

    const userData2 = {
      username: 'uniqueuser',
      email: 'user2@test.com',
      passwordHash: 'password456'
    };

    await new User(userData1).save();
    await expect(new User(userData2).save()).rejects.toThrow();
  });

  it('should enforce unique email', async () => {
    const userData1 = {
      username: 'user1',
      email: 'same@test.com',
      passwordHash: 'password123'
    };

    const userData2 = {
      username: 'user2',
      email: 'same@test.com',
      passwordHash: 'password456'
    };

    await new User(userData1).save();
    await expect(new User(userData2).save()).rejects.toThrow();
  });

  it('should require username, email, and passwordHash', async () => {
    const incompleteUser = new User({});
    await expect(incompleteUser.save()).rejects.toThrow();
  });
});
