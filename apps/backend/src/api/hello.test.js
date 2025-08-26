const request = require('supertest');
const express = require('express');
const helloRouter = require('./hello');

const app = express();
app.use('/', helloRouter);

describe('GET /', () => {
  it('should return "Hello World" message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'Hello World' });
  });
});
