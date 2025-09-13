const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost'); // Import the BlogPost model
const Comment = require('../models/Comment'); // Import the Comment model
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth'); // Import authentication middleware

// POST /api/posts - Create a new blog post (AC: 1, 3, 4, 6)
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, summary, coverPhotoUrl } = req.body;

    // Validate all required fields
    const requiredFields = ['title', 'content', 'summary', 'coverPhotoUrl'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: true
      });
    }

    // Create post with all required fields
    const newPost = new BlogPost({
      title,
      content,
      summary,
      coverPhotoUrl,
      tags: tags || []
    });

    console.log('Attempting to save new post:', newPost); // Added log
    await newPost.save();
    console.log('New post saved successfully:', newPost); // Added log
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message,
      error: true
    });
  }
});

// GET /api/posts - Retrieve a list of all blog posts (AC: 1, 5, 6)
router.get('/posts', async (req, res) => {
  try {
    const { tags } = req.query;
    let filter = {};

    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    const posts = await BlogPost.find(filter);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:id - Retrieve a single blog post by ID (AC: 1, 6)
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await BlogPost.findById(id);

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/posts/:id - Update a blog post by ID (AC: 1, 6)
router.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, summary, coverPhotoUrl } = req.body;

    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate all required fields
    const requiredFields = ['title', 'content', 'summary', 'coverPhotoUrl'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: true
      });
    }

    // Find and update the post
    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      {
        title,
        content,
        summary,
        coverPhotoUrl,
        tags: tags || []
      },
      { new: true, runValidators: true }
    );

    if (updatedPost) {
      res.status(200).json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error: ' + error.message,
        error: true
      });
    } else {
      res.status(500).json({ 
        message: 'Server error: ' + error.message,
        error: true
      });
    }
  }
});

// DELETE /api/posts/:id - Delete a blog post by ID (AC: 1, 6)
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find and delete the post
    const deletedPost = await BlogPost.findByIdAndDelete(id);

    if (deletedPost) {
      res.status(200).json({ message: 'Post deleted successfully', deletedPost });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message,
      error: true
    });
  }
});

// POST /api/posts/:postId/comments - Add a new comment to a post (AC: 2, 6)
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { authorName, commentText } = req.body;

    if (!authorName || !commentText) {
      return res.status(400).json({ message: 'Missing required fields: authorName, commentText' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const newComment = new Comment({
      postId,
      authorName,
      commentText,
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:id/comments - Get all comments for a post (AC: 2, 6)
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const comments = await Comment.find({ postId: id }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:id/like - Like or unlike a post (AC: 2, 6)
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already liked this post
    const userIndex = post.likedBy.indexOf(userId);
    let isLiked = false;

    if (userIndex > -1) {
      // User already liked - remove like (unlike)
      post.likedBy.splice(userIndex, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      // User hasn't liked - add like
      post.likedBy.push(userId);
      post.likeCount += 1;
      isLiked = true;
    }

    await post.save();
    res.status(200).json({ 
      likeCount: post.likeCount, 
      isLiked: isLiked,
      message: isLiked ? 'Post liked successfully' : 'Post unliked successfully'
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
