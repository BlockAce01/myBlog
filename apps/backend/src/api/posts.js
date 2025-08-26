const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost'); // Import the BlogPost model

// POST /api/posts - Create a new blog post (AC: 1)
router.post('/posts', async (req, res) => {
  try {
    const { title, summary, content, coverPhotoUrl, tags, author } = req.body;

    // Basic validation
    if (!title || !summary || !content || !coverPhotoUrl || !author) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPost = new BlogPost({
      title,
      summary,
      content,
      coverPhotoUrl,
      tags: tags || [],
      author,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts - Retrieve a list of all blog posts (AC: 2)
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

// GET /api/posts/:id - Retrieve a single blog post by ID (AC: 3)
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

// PUT /api/posts/:id - Update an existing blog post (AC: 4)
router.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, coverPhotoUrl, tags, author } = req.body;

    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      { title, summary, content, coverPhotoUrl, tags, author },
      { new: true, runValidators: true }
    );

    if (updatedPost) {
      res.status(200).json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id - Remove a blog post (AC: 5)
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await BlogPost.findByIdAndDelete(id);

    if (deletedPost) {
      res.status(200).json({ message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
