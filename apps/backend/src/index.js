const express = require('express');
const mongoose = require('mongoose');
const helloRouter = require('./api/hello');
const postsRouter = require('./api/posts');

const app = express();
const port = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myblog';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use('/api/hello', helloRouter);
app.use('/api', postsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
