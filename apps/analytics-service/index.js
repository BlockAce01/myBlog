const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// In-memory store for view counts
const viewCounts = {};

app.post('/views/:postId', (req, res) => {
  const { postId } = req.params;
  if (viewCounts[postId]) {
    viewCounts[postId]++;
  } else {
    viewCounts[postId] = 1;
  }
  res.status(200).send({ viewCount: viewCounts[postId] });
});

app.get('/views/:postId', (req, res) => {
  const { postId } = req.params;
  const viewCount = viewCounts[postId] || 0;
  res.status(200).send({ viewCount });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Analytics service listening at http://localhost:${port}`);
  });
}

module.exports = app;
