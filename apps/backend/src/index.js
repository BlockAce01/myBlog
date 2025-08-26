const express = require('express');
const helloRouter = require('./api/hello'); // Import the new router

const app = express();
const port = process.env.PORT || 3003; // Changed port to 3003 to avoid EADDRINUSE error

app.use('/', helloRouter); // Mount the new router at the root level

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
