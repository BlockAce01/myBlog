
require('dotenv').config();
const express = require('express');
const { connectDB, disconnectDB } = require('./utils/db');
const helloRouter = require('./api/hello');
const postsRouter = require('./api/posts');
const analyticsRouter = require('./api/analytics');
require('./models/BlogPost');
require('./models/Comment');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3003;

app.use('/api/hello', helloRouter);
app.use('/api', postsRouter);
app.use('/api/analytics', analyticsRouter);

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

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

startServer();
