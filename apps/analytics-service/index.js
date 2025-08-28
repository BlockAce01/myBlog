const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());

// In-memory store for view counts
const viewCounts = {};
// In-memory store for like counts
const likeCounts = {};

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

app.post('/likes/:postId', (req, res) => {
  const { postId } = req.params;
  if (likeCounts[postId]) {
    likeCounts[postId]++;
  } else {
    likeCounts[postId] = 1;
  }
  res.status(200).send({ likeCount: likeCounts[postId] });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Analytics service listening at http://localhost:${port}`);
  });
}

module.exports = app;