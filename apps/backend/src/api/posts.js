const express = require('express');
const router = express.Router();

const posts = [
  {
    _id: "1",
    title: "My First Blog Post",
    summary: "This is the summary of my first blog post.",
    content: "This is the full content of my first blog post. It's written in Markdown.",
    author: "John Doe",
    coverPhotoUrl: "https://via.placeholder.com/150",
    tags: ["tech", "programming"],
    publicationDate: new Date("2025-08-26T10:00:00Z"),
    viewCount: 150,
    likeCount: 25,
  },
  {
    _id: "2",
    title: "My Second Blog Post",
    summary: "This is the summary of my second blog post.",
    content: "This is the full content of my second blog post. It's also written in Markdown.",
    author: "Jane Smith",
    coverPhotoUrl: "https://via.placeholder.com/150",
    tags: ["lifestyle", "travel"],
    publicationDate: new Date("2025-08-27T12:30:00Z"),
    viewCount: 300,
    likeCount: 50,
  }
];

router.get('/posts', (req, res) => {
  res.status(200).json(posts);
});

module.exports = router;
