const request = require('supertest');
const app = require('../../../src/index'); // Adjust path to your Express app
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const bcrypt = require('bcrypt');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  const hashedPassword = await bcrypt.hash('adminpassword', 12);
  // Create user directly in database to bypass Mongoose middleware
  await mongoose.connection.db.collection('users').insertOne({
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

describe('POST /api/auth/login', () => {
  it('should successfully log in an admin user and return a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'adminpassword'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 400 for missing username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'adminpassword'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Username and password are required');
  });

  it('should return 400 for missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Username and password are required');
  });

  it('should return 401 if user does not exist', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent',
        password: 'password'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
