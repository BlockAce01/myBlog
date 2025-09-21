const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    coverPhotoUrl: { type: String, required: true },
    tags: { type: [String], required: true },
    publicationDate: { type: Date, default: Date.now },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] }, // Track user IDs who liked this post
    status: {
      type: String,
      enum: ["draft", "published", "hidden", "scheduled"],
      default: "draft",
    },
    scheduledPublishDate: { type: Date },
    slug: { type: String, required: true, unique: true },
    lastSavedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 0 }, // For optimistic locking
  },
  {
    toJSON: { virtuals: true },
  },
);

blogPostSchema.index({
  title: "text",
  summary: "text",
  content: "text",
  tags: "text",
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
