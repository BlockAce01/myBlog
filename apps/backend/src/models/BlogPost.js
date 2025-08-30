const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  coverPhotoUrl: { type: String, required: true },
  tags: { type: [String], required: true },
  publicationDate: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('BlogPost', blogPostSchema);