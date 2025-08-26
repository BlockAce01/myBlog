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
