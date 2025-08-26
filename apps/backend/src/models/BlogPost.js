const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true }, // Markdown
  author: { type: String, required: true }, // Add author field
  coverPhotoUrl: { type: String, required: true }, // URL to the image in S3
  tags: [{ type: String }],
  publicationDate: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
