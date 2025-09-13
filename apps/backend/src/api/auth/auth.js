const express = require('express');
const router = express.Router();

// Auth service skeleton
// TODO: Implement authentication routes (register, login, me)

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Auth service endpoint' });
});

module.exports = router;
