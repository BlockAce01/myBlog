const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const postsRouter = require('./posts');
const BlogPost = require('../models/BlogPost');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/', postsRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await BlogPost.deleteMany({});
  // Seed data for tests
  await BlogPost.create({
    title: "Test Post 1",
    summary: "Summary 1",
    content: "Content 1",
    coverPhotoUrl: "http://example.com/photo1.jpg",
    tags: ["tech", "testing"],
    author: "Author 1",
  });
  await BlogPost.create({
    title: "Test Post 2",
    summary: "Summary 2",
    content: "Content 2",
    coverPhotoUrl: "http://example.com/photo2.jpg",
    tags: ["news", "testing"],
    author: "Author 2",
  });
});

describe('POST /posts', () => {
  it('should create a new blog post', async () => {
    const newPost = {
      title: "New Post",
      summary: "New Summary",
      content: "New Content",
      coverPhotoUrl: "http://example.com/new.jpg",
      tags: ["new", "post"],
      author: "New Author",
    };
    const res = await request(app).post('/posts').send(newPost);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual(newPost.title);
    expect(res.body.author).toEqual(newPost.author);
  });

  it('should return 400 if required fields are missing', async () => {
    const invalidPost = {
      title: "Invalid Post",
      summary: "Invalid Summary",
      // content is missing
      coverPhotoUrl: "http://example.com/invalid.jpg",
      author: "Invalid Author",
    };
    const res = await request(app).post('/posts').send(invalidPost);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Missing required fields');
  });
});

describe('GET /posts', () => {
  it('should return a list of all blog posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(2);
    expect(res.body[0]).toHaveProperty('title', 'Test Post 1');
  });

  it('should return a list of posts filtered by tags', async () => {
    const res = await request(app).get('/posts?tags=tech');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toHaveProperty('title', 'Test Post 1');
  });

  it('should return an empty array if no posts match tags', async () => {
    const res = await request(app).get('/posts?tags=nonexistent');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(0);
  });
});

describe('GET /posts/:id', () => {
  it('should return a single post by ID', async () => {
    const post = await BlogPost.findOne({ title: 'Test Post 1' });
    const res = await request(app).get(`/posts/${post._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', post._id.toString());
    expect(res.body).toHaveProperty('title', 'Test Post 1');
  });

  it('should return 404 if post is not found', async () => {
    const res = await request(app).get('/posts/60d5ec49f8c7a7001c8e4d1a'); // Non-existent ID
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Post not found');
  });

  it('should return 400 for invalid ID format', async () => {
    const res = await request(app).get('/posts/invalidid');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid post ID');
  });
});

describe('PUT /posts/:id', () => {
  it('should update an existing blog post', async () => {
    const post = await BlogPost.findOne({ title: 'Test Post 1' });
    const updatedData = {
      title: "Updated Title",
      summary: "Updated Summary",
      content: "Updated Content",
      coverPhotoUrl: "http://example.com/updated.jpg",
      tags: ["updated", "tech"],
      author: "Updated Author",
    };
    const res = await request(app).put(`/posts/${post._id}`).send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', updatedData.title);
    expect(res.body).toHaveProperty('author', updatedData.author);
  });

  it('should return 404 if post to update is not found', async () => {
    const updatedData = { title: "Non-existent" };
    const res = await request(app).put('/posts/60d5ec49f8c7a7001c8e4d1a').send(updatedData);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Post not found');
  });

  it('should return 400 for invalid ID format during update', async () => {
    const updatedData = { title: "Invalid" };
    const res = await request(app).put('/posts/invalidid').send(updatedData);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid post ID');
  });
});

describe('DELETE /posts/:id', () => {
  it('should delete a blog post', async () => {
    const post = await BlogPost.findOne({ title: 'Test Post 1' });
    const res = await request(app).delete(`/posts/${post._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Post deleted successfully');

    const deletedPost = await BlogPost.findById(post._id);
    expect(deletedPost).toBeNull();
  });

  it('should return 404 if post to delete is not found', async () => {
    const res = await request(app).delete('/posts/60d5ec49f8c7a7001c8e4d1a');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Post not found');
  });

  it('should return 400 for invalid ID format during delete', async () => {
    const res = await request(app).delete('/posts/invalidid');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid post ID');
  });
});
