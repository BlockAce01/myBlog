const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost'); // Import the BlogPost model
const Comment = require('../models/Comment'); // Import the Comment model
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth'); // Import authentication middleware
const { generateSlug, generateUniqueSlug } = require('../utils/slug'); // Import slug utilities

// POST /api/posts - Create a new blog post (AC: 1, 3, 4, 6)
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, summary, coverPhotoUrl, status, scheduledPublishDate } = req.body;

    // Validate all required fields
    const requiredFields = ['title', 'content', 'summary', 'coverPhotoUrl'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: true
      });
    }

    // Validate status and scheduledPublishDate
    if (status === 'scheduled' && !scheduledPublishDate) {
      return res.status(400).json({
        message: 'scheduledPublishDate is required when status is scheduled',
        error: true
      });
    }

    if (status === 'scheduled' && new Date(scheduledPublishDate) <= new Date()) {
      return res.status(400).json({
        message: 'scheduledPublishDate must be in the future',
        error: true
      });
    }

    // Generate unique slug
    const baseSlug = generateSlug(title);
    const existingPosts = await BlogPost.find({}, 'slug');
    const existingSlugs = existingPosts.map(p => p.slug);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    // Create post with all required fields
    const newPost = new BlogPost({
      title,
      content,
      summary,
      coverPhotoUrl,
      tags: tags || [],
      slug,
      status: status || 'draft',
      scheduledPublishDate: status === 'scheduled' ? new Date(scheduledPublishDate) : undefined
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
    const { tags, admin } = req.query;
    let filter = {};

    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    // If not admin request, only show published posts and scheduled posts that are due
    if (admin !== 'true') {
      const now = new Date();
      filter.$or = [
        { status: 'published' },
        {
          status: 'scheduled',
          scheduledPublishDate: { $lte: now }
        }
      ];
    }

    const posts = await BlogPost.find(filter).sort({ publicationDate: -1 });
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
    const { title, content, tags, summary, coverPhotoUrl, status, scheduledPublishDate, version } = req.body;

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

    // Validate status and scheduledPublishDate
    if (status === 'scheduled' && !scheduledPublishDate) {
      return res.status(400).json({
        message: 'scheduledPublishDate is required when status is scheduled',
        error: true
      });
    }

    if (status === 'scheduled' && new Date(scheduledPublishDate) <= new Date()) {
      return res.status(400).json({
        message: 'scheduledPublishDate must be in the future',
        error: true
      });
    }

    // Find the post first to check version
    const existingPost = await BlogPost.findById(id);
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check version for optimistic locking
    if (version !== undefined && existingPost.version !== version) {
      return res.status(409).json({
        message: 'Post has been modified by another user. Please refresh and try again.',
        error: 'version_conflict',
        currentVersion: existingPost.version
      });
    }

    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (title !== existingPost.title) {
      const baseSlug = generateSlug(title);
      const existingPosts = await BlogPost.find({ _id: { $ne: id } }, 'slug');
      const existingSlugs = existingPosts.map(p => p.slug);
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Prepare update data
    const updateData = {
      title,
      content,
      summary,
      coverPhotoUrl,
      tags: tags || [],
      slug,
      status: status || existingPost.status,
      lastSavedAt: new Date(),
      version: existingPost.version + 1
    };

    // Add scheduledPublishDate if status is scheduled
    if (status === 'scheduled') {
      updateData.scheduledPublishDate = new Date(scheduledPublishDate);
    } else if (status !== 'scheduled' && existingPost.scheduledPublishDate) {
      // Remove scheduledPublishDate if status changed from scheduled
      updateData.$unset = { scheduledPublishDate: 1 };
    }

    // Find and update the post
    const updatedPost = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
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

// GET /api/posts/slug/:slug - Retrieve a single blog post by slug
router.get('/posts/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { admin } = req.query;

    const post = await BlogPost.findOne({ slug });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check visibility for non-admin users
    if (admin !== 'true') {
      const now = new Date();
      const isVisible = post.status === 'published' ||
        (post.status === 'scheduled' && post.scheduledPublishDate && post.scheduledPublishDate <= now);

      if (!isVisible) {
        return res.status(404).json({ message: 'Post not found' });
      }
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/drafts - Auto-save draft (create new draft)
router.post('/posts/drafts', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, summary, coverPhotoUrl, status, scheduledPublishDate } = req.body;

    // Generate unique slug if title exists
    let slug = '';
    if (title) {
      const baseSlug = generateSlug(title);
      const existingPosts = await BlogPost.find({}, 'slug');
      const existingSlugs = existingPosts.map(p => p.slug);
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Create draft post
    const draftPost = new BlogPost({
      title: title || 'Untitled Draft',
      content: content || '',
      summary: summary || '',
      coverPhotoUrl: coverPhotoUrl || '',
      tags: tags || [],
      slug,
      status: status || 'draft',
      scheduledPublishDate: status === 'scheduled' ? new Date(scheduledPublishDate) : undefined,
      lastSavedAt: new Date()
    });

    await draftPost.save();
    res.status(201).json(draftPost);
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message,
      error: true
    });
  }
});

// PUT /api/posts/drafts/:id - Auto-save existing draft
router.put('/posts/drafts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, summary, coverPhotoUrl, status, scheduledPublishDate, version } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid draft ID' });
    }

    // Find the draft first to check version
    const existingDraft = await BlogPost.findById(id);
    if (!existingDraft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Check version for optimistic locking (optional for drafts)
    if (version !== undefined && existingDraft.version !== version) {
      return res.status(409).json({
        message: 'Draft has been modified. Please refresh and try again.',
        error: 'version_conflict',
        currentVersion: existingDraft.version
      });
    }

    // Generate new slug if title changed
    let slug = existingDraft.slug;
    if (title && title !== existingDraft.title) {
      const baseSlug = generateSlug(title);
      const existingPosts = await BlogPost.find({ _id: { $ne: id } }, 'slug');
      const existingSlugs = existingPosts.map(p => p.slug);
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Update draft
    const updateData = {
      title: title || existingDraft.title,
      content: content || existingDraft.content,
      summary: summary || existingDraft.summary,
      coverPhotoUrl: coverPhotoUrl || existingDraft.coverPhotoUrl,
      tags: tags || existingDraft.tags,
      slug,
      status: status || existingDraft.status,
      lastSavedAt: new Date(),
      version: existingDraft.version + 1
    };

    // Handle scheduled publishing
    if (status === 'scheduled') {
      updateData.scheduledPublishDate = new Date(scheduledPublishDate);
    } else if (status !== 'scheduled' && existingDraft.scheduledPublishDate) {
      updateData.$unset = { scheduledPublishDate: 1 };
    }

    const updatedDraft = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedDraft) {
      res.status(200).json(updatedDraft);
    } else {
      res.status(404).json({ message: 'Draft not found' });
    }
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message,
      error: true
    });
  }
});

// GET /api/posts/drafts/:id - Retrieve a draft by ID
router.get('/posts/drafts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid draft ID' });
    }

    const draft = await BlogPost.findById(id);

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    res.status(200).json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
