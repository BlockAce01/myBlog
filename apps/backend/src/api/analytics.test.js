const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const analyticsRouter = require('./analytics');
const BlogPost = require('../models/BlogPost');

// Mock the BlogPost model
jest.mock('../models/BlogPost');

const app = express();
app.use(express.json());
app.use('/analytics', analyticsRouter);

describe('Analytics API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /analytics/views/:id', () => {
    it('should increment the view count of a post', async () => {
      const mockPost = { _id: '60d21b4667d0d8992e610c85', viewCount: 10 };
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findByIdAndUpdate.mockResolvedValue(mockPost);

      const res = await request(app).post('/analytics/views/60d21b4667d0d8992e610c85');

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('View count incremented');
      expect(res.body.viewCount).toEqual(10);
      expect(BlogPost.findByIdAndUpdate).toHaveBeenCalledWith(
        '60d21b4667d0d8992e610c85',
        { $inc: { viewCount: 1 } },
        { new: true }
      );
    });

    it('should return 404 if the post is not found', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        BlogPost.findByIdAndUpdate.mockResolvedValue(null);
  
        const res = await request(app).post('/analytics/views/60d21b4667d0d8992e610c85');
  
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Post not found');
      });
  });

  describe('POST /analytics/likes/:id', () => {
    it('should increment the like count of a post', async () => {
      const mockPost = { _id: '60d21b4667d0d8992e610c85', likeCount: 5 };
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findByIdAndUpdate.mockResolvedValue(mockPost);

      const res = await request(app).post('/analytics/likes/60d21b4667d0d8992e610c85');

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Like count incremented');
      expect(res.body.likeCount).toEqual(5);
      expect(BlogPost.findByIdAndUpdate).toHaveBeenCalledWith(
        '60d21b4667d0d8992e610c85',
        { $inc: { likeCount: 1 } },
        { new: true }
      );
    });

    it('should return 404 if the post is not found', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        BlogPost.findByIdAndUpdate.mockResolvedValue(null);
  
        const res = await request(app).post('/analytics/likes/60d21b4667d0d8992e610c85');
  
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Post not found');
      });
  });
});