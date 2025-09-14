const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const postsRouter = require('./posts');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');

// Mock the models
jest.mock('../models/BlogPost');
jest.mock('../models/Comment');

// Mock the slug utilities
jest.mock('../utils/slug', () => ({
  generateSlug: jest.fn(() => 'test-post'),
  generateUniqueSlug: jest.fn(() => 'test-post')
}));

// Mock the authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    // Check if Authorization header is present
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      if (token === 'invalid-token') {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      req.user = { userId: '507f1f77bcf86cd799439011', role: 'admin' };
      next();
    } else {
      return res.status(401).json({ message: 'Access token required' });
    }
  })
}));

// Create test app
const app = express();
app.use(express.json());
app.use('/api', postsRouter);

// Test data
const testUser = {
  userId: '507f1f77bcf86cd799439011',
  role: 'admin'
};

const createTestToken = () => {
  return jwt.sign(testUser, process.env.JWT_SECRET || 'test-secret-key');
};

describe('Posts API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should return a list of posts', async () => {
      const mockPosts = [{ title: 'Post 1' }, { title: 'Post 2' }];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockPosts)
      };
      BlogPost.find.mockReturnValue(mockQuery);

      const res = await request(app).get('/api/posts');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPosts);
    });

    it('should filter posts by tags', async () => {
      const mockPosts = [{ title: 'React Post', tags: ['react'] }];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockPosts)
      };
      BlogPost.find.mockReturnValue(mockQuery);

      const res = await request(app).get('/api/posts?tags=react');
      expect(res.statusCode).toEqual(200);
      // The actual query includes additional filtering for published/scheduled posts
      expect(BlogPost.find).toHaveBeenCalledWith({
        tags: { '$in': ['react'] },
        $or: [
          { status: 'published' },
          { status: 'scheduled', scheduledPublishDate: { $lte: expect.any(Date) } }
        ]
      });
      expect(res.body).toEqual(mockPosts);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a single post if found by ID', async () => {
        const mockPost = { _id: '60d21b4667d0d8992e610c85', title: 'Found Post', status: 'published' };
        // Mock the static method isValid of mongoose.Types.ObjectId
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        BlogPost.findById.mockResolvedValue(mockPost);

        const res = await request(app).get('/api/posts/60d21b4667d0d8992e610c85');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockPost);
    });

    it('should return a single post if found by slug', async () => {
        const mockPost = { _id: '60d21b4667d0d8992e610c85', title: 'Found Post', slug: 'found-post', status: 'published' };
        // Mock the static method isValid of mongoose.Types.ObjectId to return false for slug
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
        BlogPost.findById.mockResolvedValue(null);
        BlogPost.findOne.mockResolvedValue(mockPost);

        const res = await request(app).get('/api/posts/found-post');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockPost);
    });

    it('should return 404 if post not found', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
        BlogPost.findById.mockResolvedValue(null);
        BlogPost.findOne.mockResolvedValue(null);

        const res = await request(app).get('/api/posts/60d21b4667d0d8992e610c85');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Post not found');
    });

    it('should return 404 for an invalid post ID/slug', async () => {
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
        BlogPost.findById.mockResolvedValue(null);
        BlogPost.findOne.mockResolvedValue(null);
        const res = await request(app).get('/api/posts/invalid-id');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Post not found');
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

  describe('POST /api/posts', () => {
    const validPostData = {
      title: 'Test Post',
      content: 'Test content',
      summary: 'Test summary',
      coverPhotoUrl: 'https://example.com/image.jpg'
    };

    it('should create a new post with valid authentication', async () => {
      const mockSavedPost = {
        _id: '60d21b4667d0d8992e610c85',
        ...validPostData,
        tags: [],
        slug: 'test-post',
        status: 'draft',
        version: 0
      };

      // Mock BlogPost.find for slug generation - return empty array
      BlogPost.find.mockResolvedValue([]);

      // Mock the BlogPost constructor
      const mockPostInstance = {
        ...validPostData,
        tags: [],
        slug: 'test-post',
        status: 'draft',
        version: 0,
        save: jest.fn().mockImplementation(async function() {
          // Assign the _id to the instance itself
          Object.assign(this, mockSavedPost);
          return this;
        })
      };

      BlogPost.mockImplementation((data) => mockPostInstance);

      const token = createTestToken();
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(validPostData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(mockSavedPost);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send(validPostData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Access token required');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer invalid-token')
        .send(validPostData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid or expired token');
    });

    it('should return 400 for missing required fields', async () => {
      const token = createTestToken();
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Post' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Missing required fields');
    });
  });

  describe('PUT /api/posts/:id', () => {
    const updateData = {
      title: 'Updated Post',
      content: 'Updated content',
      summary: 'Updated summary',
      coverPhotoUrl: 'https://example.com/updated.jpg'
    };

    it('should update a post with valid authentication', async () => {
      const mockExistingPost = {
        _id: '60d21b4667d0d8992e610c85',
        title: 'Original Post',
        content: 'Original content',
        summary: 'Original summary',
        coverPhotoUrl: 'https://example.com/original.jpg',
        version: 0
      };
      const mockUpdatedPost = { _id: '60d21b4667d0d8992e610c85', ...updateData, version: 1 };

      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findById.mockResolvedValue(mockExistingPost);
      BlogPost.findByIdAndUpdate.mockResolvedValue(mockUpdatedPost);
      BlogPost.find.mockResolvedValue([]); // For slug uniqueness check

      const token = createTestToken();
      const res = await request(app)
        .put('/api/posts/60d21b4667d0d8992e610c85')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockUpdatedPost);
    });

    it('should return 401 without authentication', async () => {
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      const res = await request(app)
        .put('/api/posts/60d21b4667d0d8992e610c85')
        .send(updateData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Access token required');
    });

    it('should return 404 if post not found', async () => {
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findByIdAndUpdate.mockResolvedValue(null);

      const token = createTestToken();
      const res = await request(app)
        .put('/api/posts/60d21b4667d0d8992e610c85')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Post not found');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post with valid authentication', async () => {
      const mockDeletedPost = { _id: '60d21b4667d0d8992e610c85', title: 'Deleted Post' };
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findByIdAndDelete.mockResolvedValue(mockDeletedPost);

      const token = createTestToken();
      const res = await request(app)
        .delete('/api/posts/60d21b4667d0d8992e610c85')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Post deleted successfully');
      expect(res.body.deletedPost).toEqual(mockDeletedPost);
    });

    it('should return 401 without authentication', async () => {
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      const res = await request(app)
        .delete('/api/posts/60d21b4667d0d8992e610c85');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Access token required');
    });

    it('should return 404 if post not found', async () => {
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      BlogPost.findByIdAndDelete.mockResolvedValue(null);

      const token = createTestToken();
      const res = await request(app)
        .delete('/api/posts/60d21b4667d0d8992e610c85')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Post not found');
    });
  });
});
