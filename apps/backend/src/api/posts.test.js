const request = require('supertest');
const express = require('express');
const postsRouter = require('./posts');

const app = express();
app.use('/', postsRouter);

describe('GET /posts', () => {
  it('should return a list of posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('_id');
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('content');
    expect(res.body[0]).toHaveProperty('author');
  });
});

describe('GET /posts/:id', () => {
  it('should return a single post by ID', async () => {
    const res = await request(app).get('/posts/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', '1');
    expect(res.body).toHaveProperty('title', 'My First Blog Post');
    expect(res.body).toHaveProperty('content', 'This is the full content of my first blog post. It\'s written in Markdown.');
    expect(res.body).toHaveProperty('author', 'John Doe');
    expect(res.body).not.toHaveProperty('_id');
    expect(res.body).not.toHaveProperty('summary');
    expect(res.body).not.toHaveProperty('coverPhotoUrl');
    expect(res.body).not.toHaveProperty('tags');
    expect(res.body).not.toHaveProperty('publicationDate');
    expect(res.body).not.toHaveProperty('viewCount');
    expect(res.body).not.toHaveProperty('likeCount');
  });

  it('should return 404 if post is not found', async () => {
    const res = await request(app).get('/posts/999');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Post not found');
  });
});
