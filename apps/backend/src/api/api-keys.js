const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { adminCrudOnly, apiAccessOnly } = require('../middleware/adminOnly');
const { apiKeyLimiter } = require('../middleware/rate-limit');

const router = express.Router();

// In-memory storage for API keys (use Redis in production)
const apiKeys = new Map();
const keyMetadata = new Map();

// Generate API key with metadata
function generateApiKey(userId, name, permissions = ['read']) {
  const keyId = crypto.randomUUID();
  const secret = crypto.randomBytes(32).toString('hex');
  const apiKey = `ak_${keyId}`;

  const metadata = {
    id: keyId,
    name: name || `API Key ${keyId.slice(0, 8)}`,
    userId,
    permissions,
    createdAt: new Date(),
    lastUsed: null,
    isActive: true,
    usageCount: 0
  };

  apiKeys.set(apiKey, secret);
  keyMetadata.set(keyId, metadata);

  return { apiKey, secret, metadata };
}

// Verify HMAC signature
function verifyHmacSignature(apiKey, signature, timestamp, payload, secret) {
  // Check timestamp (prevent replay attacks - 5 minute window)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  const timeDiff = Math.abs(now - requestTime);

  if (timeDiff > 5 * 60 * 1000) { // 5 minutes
    return false;
  }

  // Create signature string
  const signatureString = `${timestamp}.${JSON.stringify(payload)}`;

  // Generate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureString)
    .digest('hex');

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Middleware to verify API key authentication
const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    if (!apiKey || !signature || !timestamp) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing API key authentication headers'
      });
    }

    // Extract key ID from API key
    const keyId = apiKey.replace('ak_', '');
    const metadata = keyMetadata.get(keyId);

    if (!metadata || !metadata.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or inactive API key'
      });
    }

    // Get secret for this key
    const secret = apiKeys.get(apiKey);
    if (!secret) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key not found'
      });
    }

    // Verify HMAC signature
    const isValid = verifyHmacSignature(apiKey, signature, timestamp, req.body, secret);
    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid signature'
      });
    }

    // Update usage metadata
    metadata.lastUsed = new Date();
    metadata.usageCount += 1;

    // Add user and permissions to request
    req.apiUser = {
      id: metadata.userId,
      permissions: metadata.permissions,
      keyId: metadata.id
    };

    next();
  } catch (error) {
    console.error('API key verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'API key verification failed'
    });
  }
};

// POST /admin/api-keys - Create new API key
router.post('/api-keys', authenticateToken, adminCrudOnly, apiKeyLimiter, async (req, res) => {
  try {
    const { name, permissions } = req.body;

    // Validate permissions
    const validPermissions = ['read', 'write', 'delete', 'admin'];
    const requestedPermissions = permissions || ['read'];

    const invalidPermissions = requestedPermissions.filter(p => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`
      });
    }

    // Generate API key
    const { apiKey, secret, metadata } = generateApiKey(req.user.id, name, requestedPermissions);

    res.status(201).json({
      success: true,
      apiKey,
      secret, // Only shown once for security
      metadata: {
        id: metadata.id,
        name: metadata.name,
        permissions: metadata.permissions,
        createdAt: metadata.createdAt
      },
      warning: 'Store the secret securely - it will not be shown again'
    });

  } catch (error) {
    console.error('API key creation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create API key'
    });
  }
});

// GET /admin/api-keys - List API keys for current user
router.get('/api-keys', authenticateToken, adminCrudOnly, async (req, res) => {
  try {
    // Get all keys for this user
    const userKeys = Array.from(keyMetadata.values())
      .filter(metadata => metadata.userId === req.user.id)
      .map(metadata => ({
        id: metadata.id,
        name: metadata.name,
        permissions: metadata.permissions,
        createdAt: metadata.createdAt,
        lastUsed: metadata.lastUsed,
        usageCount: metadata.usageCount,
        isActive: metadata.isActive
      }));

    res.json({
      success: true,
      apiKeys: userKeys
    });

  } catch (error) {
    console.error('API key listing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to list API keys'
    });
  }
});

// PUT /admin/api-keys/:id - Update API key
router.put('/api-keys/:id', authenticateToken, adminCrudOnly, apiKeyLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, isActive } = req.body;

    const metadata = keyMetadata.get(id);
    if (!metadata || metadata.userId !== req.user.id) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found'
      });
    }

    // Update metadata
    if (name !== undefined) metadata.name = name;
    if (permissions !== undefined) {
      const validPermissions = ['read', 'write', 'delete', 'admin'];
      const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`
        });
      }
      metadata.permissions = permissions;
    }
    if (isActive !== undefined) metadata.isActive = isActive;

    res.json({
      success: true,
      apiKey: {
        id: metadata.id,
        name: metadata.name,
        permissions: metadata.permissions,
        isActive: metadata.isActive,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('API key update error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update API key'
    });
  }
});

// DELETE /admin/api-keys/:id - Delete API key
router.delete('/api-keys/:id', authenticateToken, adminCrudOnly, apiKeyLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const metadata = keyMetadata.get(id);
    if (!metadata || metadata.userId !== req.user.id) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found'
      });
    }

    // Remove from storage
    const apiKey = `ak_${id}`;
    apiKeys.delete(apiKey);
    keyMetadata.delete(id);

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });

  } catch (error) {
    console.error('API key deletion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete API key'
    });
  }
});

// POST /api/webhook - Example webhook endpoint for n8n integration
router.post('/webhook', verifyApiKey, async (req, res) => {
  try {
    const { event, data } = req.body;

    // Validate webhook payload
    if (!event || !data) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing event or data in webhook payload'
      });
    }

    // Check if API key has webhook permission
    if (!req.apiUser.permissions.includes('write')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'API key does not have webhook permissions'
      });
    }

    // Process webhook (example: create blog post)
    console.log(`Webhook received from API key ${req.apiUser.keyId}:`, { event, data });

    // Example webhook processing
    if (event === 'create_post') {
      // Here you would create a blog post
      // This is just an example
      console.log('Processing create_post webhook');
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      event,
      processedAt: new Date()
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process webhook'
    });
  }
});

module.exports = {
  router,
  verifyApiKey
};
