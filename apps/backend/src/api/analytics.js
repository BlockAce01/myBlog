const express = require("express");
const router = express.Router();
const BlogPost = require("../models/BlogPost");
const mongoose = require("mongoose");

// POST /analytics/views/:id - Increment the view count for a post (AC: 4, 6)
router.post("/views/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let post;

    // Try to find by ObjectID first
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findById(id);
    }

    // If not found by ObjectID, try to find by slug
    if (!post) {
      post = await BlogPost.findOne({ slug: id });
    }

    // If still not found, return 404
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    res.status(200).json({
      message: "View count incremented",
      viewCount: post.viewCount,
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /analytics/likes/:id - Like or unlike a post with user tracking (AC: 3, 6)
router.post("/likes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let post;

    // Try to find by ObjectID first
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findById(id);
    }

    // If not found by ObjectID, try to find by slug
    if (!post) {
      post = await BlogPost.findOne({ slug: id });
    }

    // If still not found, return 404
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
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
      message: isLiked
        ? "Post liked successfully"
        : "Post unliked successfully",
    });
  } catch (error) {
    console.error("Error liking post:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
