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
    it('should like a post successfully', async () => {
      const mockPost = {
        _id: '60d21b4667d0d8992e610c85',
        likeCount: 5,
        likedBy: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findById.mockResolvedValue(mockPost);

      const res = await request(app)
        .post('/analytics/likes/60d21b4667d0d8992e610c85')
        .send({ userId: 'test-user' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.likeCount).toEqual(6);
      expect(res.body.isLiked).toBe(true);
      expect(mockPost.save).toHaveBeenCalled();
    });

    it('should unlike a post successfully', async () => {
        const mockPost = {
          _id: '60d21b4667d0d8992e610c85',
          likeCount: 5,
          likedBy: ['test-user'],
          save: jest.fn().mockResolvedValue(true),
        };
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        BlogPost.findById.mockResolvedValue(mockPost);
  
        const res = await request(app)
          .post('/analytics/likes/60d21b4667d0d8992e610c85')
          .send({ userId: 'test-user' });
  
        expect(res.statusCode).toEqual(200);
        expect(res.body.likeCount).toEqual(4);
        expect(res.body.isLiked).toBe(false);
        expect(mockPost.save).toHaveBeenCalled();
      });

    it('should return 404 if the post is not found', async () => {
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/analytics/likes/60d21b4667d0d8992e610c85')
        .send({ userId: 'test-user' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Post not found');
    });

    it('should return 400 if userId is not provided', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
  
        const res = await request(app)
          .post('/analytics/likes/60d21b4667d0d8992e610c85');
  
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('User ID is required');
      });
  });
});