const express = require('express');
const connectDB = require('./utils/db');
const helloRouter = require('./api/hello');
const postsRouter = require('./api/posts');
require('./models/BlogPost');
require('./models/Comment');

const app = express();
const port = process.env.PORT || 3003;

connectDB();

app.use(express.json());
app.use('/api/hello', helloRouter);
app.use('/api', postsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
