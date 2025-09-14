const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
require('dotenv').config();

// Auth service
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Auth service endpoint' });
});

// Register new admin user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: 'Username, email, and password are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this username or email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // Will be hashed by pre-save middleware
      role: 'admin'
    });

    await newUser.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
