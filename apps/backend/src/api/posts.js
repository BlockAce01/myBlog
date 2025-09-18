const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const BlogPost = require('../models/BlogPost'); // Import the BlogPost model
const Comment = require('../models/Comment'); // Import the Comment model
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth'); // Import authentication middleware
const { adminCrudOnly } = require('../middleware/adminOnly'); // Import admin middleware
const { generateSlug, generateUniqueSlug } = require('../utils/slug'); // Import slug utilities
require('dotenv').config();

// POST /api/posts - Create a new blog post (AC: 1, 3, 4, 6)
router.post('/posts', authenticateToken, adminCrudOnly, async (req, res) => {
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

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({
      message: 'Server error: ' + error.message,
      error: true
    });
  }
});

// GET /api/posts/search - Search blog posts by keywords and tags
router.get('/posts/search', async (req, res) => {
  try {
    const { q, tag } = req.query;
    let filter = { status: 'published' };

    if (q) {
      filter.$text = { $search: q };
    }

    if (tag) {
      filter.tags = tag;
    }

    const posts = await BlogPost.find(filter).sort({ publicationDate: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:id - Retrieve a single blog post by ID or slug (AC: 1, 6)
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin } = req.query;

    let post;

    // Check if it's a valid ObjectId (MongoDB ID)
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findById(id);
    }

    // If not found by ID, try to find by slug
    if (!post) {
      post = await BlogPost.findOne({ slug: id });
    }

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
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/posts/:id - Update a blog post by ID (AC: 1, 6)
router.put('/posts/:id', authenticateToken, adminCrudOnly, async (req, res) => {
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
router.delete('/posts/:id', authenticateToken, adminCrudOnly, async (req, res) => {
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
    const { commentText } = req.body;

    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!commentText) {
      return res.status(400).json({ message: 'Missing required field: commentText' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Verify user exists - handle both MongoDB ObjectId and Google ID
    const User = require('../models/User');

    let user;
    let finalUserId;

    // Check if the userId is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(decoded.userId)) {
      user = await User.findById(decoded.userId);
      if (user) {
        finalUserId = user._id;
      }
    }

    // If not found by ObjectId, try to find by googleId
    if (!user) {
      const googleUser = await User.findOne({ googleId: decoded.userId });
      if (googleUser) {
        user = googleUser;
        finalUserId = googleUser._id;
      }
    }

    // If still not found, create a new user
    if (!user) {
      try {
        // Generate a unique username for Google users
        const baseUsername = decoded.email.split('@')[0].toLowerCase();
        let uniqueUsername = baseUsername;
        let counter = 1;

        // Check if username already exists
        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = `${baseUsername}${counter}`;
          counter++;
        }

        const newUser = new User({
          username: uniqueUsername, // Set unique username for Google users
          googleId: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role || 'user'
        });
        user = await newUser.save();
        finalUserId = user._id;
      } catch (createError) {
        return res.status(500).json({ message: 'Error creating user' });
      }
    }

    if (!finalUserId) {
      return res.status(500).json({ message: 'User ID not available' });
    }

    const newComment = new Comment({
      postId,
      userId: finalUserId,
      commentText,
    });

    const savedComment = await newComment.save();

    // Populate user information
    await savedComment.populate('userId', 'name profilePicture');
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/posts/:id/comments - Get all comments for a post (AC: 2, 6)
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({ postId: id, parentId: null })
      .populate('userId', 'name profilePicture')
      .sort({ createdAt: -1 });

    // For each comment, get reply count
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({
          postId: id,
          parentId: comment._id
        });
        const commentObj = comment.toObject();
        // Ensure id field is properly set
        commentObj.id = commentObj._id.toString();
        return {
          ...commentObj,
          replyCount
        };
      })
    );

    res.status(200).json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:postId/comments/:commentId/replies - Create a reply to a comment
router.post('/posts/:postId/comments/:commentId/replies', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { commentText } = req.body;

    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!commentText) {
      return res.status(400).json({ message: 'Missing required field: commentText' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid post ID or comment ID' });
    }

    // Verify parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    // Verify user exists (reuse logic from main comment creation)
    const User = require('../models/User');
    let user;
    let finalUserId;

    if (mongoose.Types.ObjectId.isValid(decoded.userId)) {
      user = await User.findById(decoded.userId);
      if (user) {
        finalUserId = user._id;
      }
    }

    if (!user) {
      const googleUser = await User.findOne({ googleId: decoded.userId });
      if (googleUser) {
        user = googleUser;
        finalUserId = googleUser._id;
      }
    }

    if (!user) {
      // Create new user if needed
      const baseUsername = decoded.email.split('@')[0].toLowerCase();
      let uniqueUsername = baseUsername;
      let counter = 1;

      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}${counter}`;
        counter++;
      }

      const newUser = new User({
        username: uniqueUsername,
        googleId: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role || 'user'
      });
      user = await newUser.save();
      finalUserId = user._id;
    }

    // Calculate depth for reply
    const replyDepth = (parentComment.depth || 0) + 1;
    if (replyDepth > 3) {
      return res.status(400).json({ message: 'Maximum reply depth exceeded' });
    }

    const reply = new Comment({
      postId,
      userId: finalUserId,
      commentText,
      parentId: commentId,
      depth: replyDepth,
    });

    const savedReply = await reply.save();
    await savedReply.populate('userId', 'name profilePicture');

    // Add id field for frontend compatibility
    const replyObj = savedReply.toObject();
    replyObj.id = replyObj._id;

    res.status(201).json(replyObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:postId/comments/:commentId/replies - Get replies for a specific comment
router.get('/posts/:postId/comments/:commentId/replies', async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid post ID or comment ID' });
    }

    const replies = await Comment.find({ postId, parentId: commentId })
      .populate('userId', 'name profilePicture')
      .sort({ createdAt: 1 }); // Oldest first for replies

    // Add id field for frontend compatibility
    const repliesWithId = replies.map(reply => {
      const replyObj = reply.toObject();
      replyObj.id = replyObj._id;
      return replyObj;
    });

    res.status(200).json(repliesWithId);
  } catch (error) {
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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
