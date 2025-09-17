const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentText: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // For replies
  depth: { type: Number, default: 0, max: 3 }, // Limit nesting depth
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true }
});

// Add index for efficient comment queries
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentId: 1 }); // For reply queries
commentSchema.index({ postId: 1, parentId: 1, createdAt: -1 }); // For threaded comments

module.exports = mongoose.model('Comment', commentSchema);
