const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDB } = require('./src/utils/db');
const BlogPost = require('./src/models/BlogPost');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  global.mongod = mongod;

  try {
    await connectDB();
    console.log('In-memory MongoDB test connection established in global setup.');
    await mongoose.connection.db.dropDatabase(); // Ensure a clean slate before all tests
    console.log('In-memory MongoDB test database dropped in global setup.');

    // Seed data for posts tests
    await BlogPost.create({
      title: "Test Post 1",
      summary: "Summary 1",
      content: "Content 1",
      coverPhotoUrl: "http://example.com/photo1.jpg",
      tags: ["tech", "testing"],
    });
    await BlogPost.create({
      title: "Test Post 2",
      summary: "Summary 2",
      content: "Content 2",
      coverPhotoUrl: "http://example.com/photo2.jpg",
      tags: ["news", "testing"],
    });

    // Seed data for analytics tests
    const analyticsTestPost = await BlogPost.create({
      title: "Analytics Test Post",
      summary: "Summary",
      content: "Content",
      coverPhotoUrl: "http://example.com/analytics.jpg",
      tags: ["analytics"],
      viewCount: 0,
      likeCount: 0,
    });
    global.analyticsTestPostId = analyticsTestPost._id.toString();

    // Seed data for comments tests
    const commentTestPost = await BlogPost.create({
      title: "Comment Test Post",
      summary: "Summary",
      content: "Content",
      coverPhotoUrl: "http://example.com/photo.jpg",
      tags: ["comments"],
    });
    global.commentTestPostId = commentTestPost._id.toString();

  } catch (err) {
    console.error('Failed to connect to in-memory MongoDB, drop database, or seed data in global setup:', err);
    // It's crucial to re-throw the error to make Jest's setup fail explicitly
    throw err;
  }
};

