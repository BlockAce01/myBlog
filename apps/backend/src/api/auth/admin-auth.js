const express = require('express');
const crypto = require('crypto');
const User = require('../../models/User');
const { authenticateToken } = require('../../middleware/auth');
const { authLimiter, keyManagementLimiter } = require('../../middleware/rate-limit');
const { audit } = require('../../utils/auditLogger');

const router = express.Router();

// POST /admin/register-key - Register public key for admin user
router.post('/register-key', keyManagementLimiter, async (req, res) => {
  try {
    const { email, publicKey } = req.body;

    if (!email || !publicKey) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and publicKey are required'
      });
    }

    // Validate public key format (basic PEM validation)
    if (!publicKey.includes('-----BEGIN PUBLIC KEY-----') ||
        !publicKey.includes('-----END PUBLIC KEY-----')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid public key format'
      });
    }

    // Find and verify the admin user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admin users can register cryptographic keys'
      });
    }

    // Check if user already has a public key
    if (user.publicKey) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User already has a registered public key. Use key rotation endpoint instead.'
      });
    }

    // Store public key in database
    await User.findByIdAndUpdate(user._id, {
      publicKey: publicKey.trim()
    });

    // Audit the key registration
    await audit.logKeyRegistration(user._id, req.ip, 'initial_registration');

    res.json({
      success: true,
      message: 'Public key registered successfully. You can now authenticate using cryptographic signatures.'
    });

  } catch (error) {
    console.error('Key registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register cryptographic key'
    });
  }
});

// POST /admin/rotate-key - Rotate public key for admin user
router.post('/rotate-key', keyManagementLimiter, async (req, res) => {
  try {
    const { email, newPublicKey, signature, challenge } = req.body;

    if (!email || !newPublicKey || !signature || !challenge) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email, newPublicKey, signature, and challenge are required'
      });
    }

    // Find and verify the admin user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'admin' || !user.publicKey) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid user or no existing key to rotate'
      });
    }

    // Verify the signature with the old key to authorize rotation
    const verifier = crypto.createVerify('SHA256');
    verifier.update(challenge);

    const signatureBuffer = Buffer.from(signature, 'hex');
    const isValid = verifier.verify(user.publicKey, signatureBuffer);

    if (!isValid) {
      await audit.logKeyRotationFailure(user._id, req.ip, 'invalid_signature');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid signature for key rotation'
      });
    }

    // Validate new public key format
    if (!newPublicKey.includes('-----BEGIN PUBLIC KEY-----') ||
        !newPublicKey.includes('-----END PUBLIC KEY-----')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid new public key format'
      });
    }

    // Update to new public key
    await User.findByIdAndUpdate(user._id, {
      publicKey: newPublicKey.trim()
    });

    // Audit the key rotation
    await audit.logKeyRotation(user._id, req.ip, 'successful_rotation');

    res.json({
      success: true,
      message: 'Public key rotated successfully.'
    });

  } catch (error) {
    console.error('Key rotation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to rotate cryptographic key'
    });
  }
});

// POST /admin/challenge - Generate authentication challenge
router.post('/challenge', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'admin' || !user.publicKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials or user not configured for key authentication'
      });
    }

    // Generate random challenge (32 bytes)
    const challenge = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();

    // Store challenge temporarily (in production, use Redis or similar)
    // For now, we'll include it in the response and verify it later
    const fullChallenge = `${challenge}.${timestamp}`;

    res.json({
      challenge: fullChallenge,
      userId: user._id
    });

  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate authentication challenge'
    });
  }
});

// POST /admin/verify - Verify signature and authenticate
router.post('/verify', authLimiter, async (req, res) => {
  try {
    const { challenge, signature, userId } = req.body;

    if (!challenge || !signature || !userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Challenge, signature, and userId are required'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin' || !user.publicKey) {
      // Audit failed login attempt
      await audit.logLoginFailure(userId, req.ip, 'invalid_user_or_key');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user or not configured for key authentication'
      });
    }

    // Verify signature (DER format from frontend)
    console.log('🔐 Signature verification debug:');
    console.log('- Challenge:', challenge);
    console.log('- Signature length:', signature.length);
    console.log('- Signature (first 50 chars):', signature.substring(0, 50));
    console.log('- User public key exists:', !!user.publicKey);

    const verifier = crypto.createVerify('SHA256');
    verifier.update(challenge);

    // Convert hex signature to Buffer for DER format verification
    const signatureBuffer = Buffer.from(signature, 'hex');
    console.log('- Signature buffer length:', signatureBuffer.length);

    let isValid;
    try {
      isValid = verifier.verify(user.publicKey, signatureBuffer);
      console.log('- Verification result:', isValid);
    } catch (verifyError) {
      console.log('❌ Signature verification error:', verifyError.message);
      console.log('- Error details:', verifyError);
      throw new Error('Signature verification failed: ' + verifyError.message);
    }

    if (!isValid) {
      // Audit failed login attempt
      await audit.logLoginFailure(user.email, req.ip, 'invalid_signature');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid signature'
      });
    }

    // Check challenge timestamp (prevent replay attacks)
    const challengeParts = challenge.split('.');
    if (challengeParts.length !== 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid challenge format'
      });
    }

    const timestamp = parseInt(challengeParts[1]);
    const now = Date.now();
    const challengeAge = now - timestamp;

    // Challenge expires after 5 minutes
    if (challengeAge > 5 * 60 * 1000) {
      // Audit failed login attempt
      await audit.logLoginFailure(user.email, req.ip, 'challenge_expired');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Challenge expired'
      });
    }

    // Generate JWT token for authenticated session
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' } // Shorter expiration for admin sessions
    );

    // Audit successful login
    await audit.logLoginSuccess(
      user._id.toString(),
      user.email,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify signature'
    });
  }
});

module.exports = router;
