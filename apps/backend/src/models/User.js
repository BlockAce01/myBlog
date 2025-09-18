const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // Admin user fields (existing)
  username: {
    type: String,
    required: function() { return this.role === 'admin'; },
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: false // We'll handle validation in pre-save middleware
  },

  // Public user fields (Google OAuth)
  googleId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },

  // Common fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },

  // Cryptographic authentication fields
  publicKey: {
    type: String,
    required: false, // Only required for admin users using key auth
    trim: true
  },

  // Role-based access control
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin', 'api_access'],
    default: []
  }]
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash password if it's provided and modified
  if (!this.passwordHash || !this.isModified('passwordHash')) return next();

  try {
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
