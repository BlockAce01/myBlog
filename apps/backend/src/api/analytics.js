const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const mongoose = require('mongoose');

// POST /analytics/views/:id - Increment the view count for a post (AC: 4, 6)
router.post('/views/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (updatedPost) {
      res.status(200).json({ message: 'View count incremented', viewCount: updatedPost.viewCount });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /analytics/likes/:id - Increment the like count for a post (AC: 3, 6)
router.post('/likes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    if (updatedPost) {
      res.status(200).json({ message: 'Like count incremented', likeCount: updatedPost.likeCount });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error incrementing like count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
