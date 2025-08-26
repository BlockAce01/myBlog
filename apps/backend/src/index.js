const express = require('express');
const helloRouter = require('./api/hello');
const postsRouter = require('./api/posts');

const app = express();
const port = process.env.PORT || 3003;

app.use('/api/hello', helloRouter);
app.use('/api', postsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});