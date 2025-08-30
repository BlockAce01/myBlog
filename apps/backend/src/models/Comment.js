const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  authorName: { type: String, required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true }
});

module.exports = mongoose.model('Comment', commentSchema);