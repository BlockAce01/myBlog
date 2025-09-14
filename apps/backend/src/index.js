
require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { connectDB, disconnectDB } = require('./utils/db');
const helloRouter = require('./api/hello');
const postsRouter = require('./api/posts');
const imagesRouter = require('./api/images');
const analyticsRouter = require('./api/analytics');
const authRouter = require('./api/auth/auth'); // Import auth router
const BlogPost = require('./models/BlogPost');
require('./models/Comment');
require('./models/User'); // Ensure User model is loaded

const app = express();
const cors = require('cors');
const path = require('path');
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3003;

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/hello', helloRouter);
app.use('/api', postsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter); // Use auth router

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Scheduled publishing cron job - runs every minute
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        const result = await BlogPost.updateMany(
          {
            status: 'scheduled',
            scheduledPublishDate: { $lte: now }
          },
          {
            $set: { status: 'published' },
            $unset: { scheduledPublishDate: 1 }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`Published ${result.modifiedCount} scheduled posts`);
        }
      } catch (error) {
        console.error('Error in scheduled publishing:', error);
      }
    });

    console.log('Scheduled publishing cron job started');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      await disconnectDB();
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB, server is not starting.', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
