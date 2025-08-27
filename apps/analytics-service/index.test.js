const request = require('supertest');
const app = require('./index');

describe('Analytics Service', () => {
  it('should increment view count on POST /views/:postId', async () => {
    const res = await request(app).post('/views/test-post');
    expect(res.statusCode).toEqual(200);
    expect(res.body.viewCount).toEqual(1);
  });

  it('should get view count on GET /views/:postId', async () => {
    await request(app).post('/views/test-post-2');
    await request(app).post('/views/test-post-2');
    const res = await request(app).get('/views/test-post-2');
    expect(res.statusCode).toEqual(200);
    expect(res.body.viewCount).toEqual(2);
  });

  it('should return 0 for a post with no views', async () => {
    const res = await request(app).get('/views/non-existent-post');
    expect(res.statusCode).toEqual(200);
    expect(res.body.viewCount).toEqual(0);
  });
});
