const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const postsRouter = require('./posts');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');

// Mock the models
jest.mock('../models/BlogPost');
jest.mock('../models/Comment');

const app = express();
app.use(express.json());
app.use('/api', postsRouter);

describe('Posts API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should return a list of posts', async () => {
      const mockPosts = [{ title: 'Post 1' }, { title: 'Post 2' }];
      BlogPost.find.mockResolvedValue(mockPosts);

      const res = await request(app).get('/api/posts');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPosts);
    });

    it('should filter posts by tags', async () => {
      const mockPosts = [{ title: 'React Post', tags: ['react'] }];
      BlogPost.find.mockResolvedValue(mockPosts);

      const res = await request(app).get('/api/posts?tags=react');
      expect(res.statusCode).toEqual(200);
      expect(BlogPost.find).toHaveBeenCalledWith({ tags: { '$in': ['react'] } });
      expect(res.body).toEqual(mockPosts);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a single post if found', async () => {
        const mockPost = { _id: '60d21b4667d0d8992e610c85', title: 'Found Post' };
        // Mock the static method isValid of mongoose.Types.ObjectId
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        BlogPost.findById.mockResolvedValue(mockPost);
    
        const res = await request(app).get('/api/posts/60d21b4667d0d8992e610c85');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockPost);
    });

    it('should return 404 if post not found', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        BlogPost.findById.mockResolvedValue(null);

        const res = await request(app).get('/api/posts/60d21b4667d0d8992e610c85');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Post not found');
    });

    it('should return 400 for an invalid post ID', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
        const res = await request(app).get('/api/posts/invalid-id');
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Invalid post ID');
    });
  });

  describe('POST /api/posts/:postId/comments', () => {
    it('should add a comment to a post', async () => {
      const newComment = { authorName: 'John Doe', commentText: 'Great post!' };
      const savedComment = { _id: 'comment123', ...newComment };
      
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      
      const save = jest.fn().mockResolvedValue(savedComment);
      Comment.mockImplementation(() => ({ save }));

      const res = await request(app)
        .post('/api/posts/60d21b4667d0d8992e610c85/comments')
        .send(newComment);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(savedComment);
    });

    it('should return 400 if required fields are missing', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        const res = await request(app)
            .post('/api/posts/60d21b4667d0d8992e610c85/comments')
            .send({ authorName: 'John Doe' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Missing required fields: authorName, commentText');
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    it('should return all comments for a post', async () => {
      const mockComments = [{ commentText: 'First comment' }, { commentText: 'Second comment' }];
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      Comment.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockComments) });

      const res = await request(app).get('/api/posts/60d21b4667d0d8992e610c85/comments');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockComments);
    });
  });
});