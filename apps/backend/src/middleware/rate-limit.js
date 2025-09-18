const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents brute force attacks and abuse
 */

// General API rate limiter (100 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints (5 attempts per minute)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts. Please wait before trying again.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom handler for auth-specific logging
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for auth endpoint: ${req.ip} - ${req.method} ${req.path}`);

    // Could add additional security measures here like IP blocking
    // or sending alerts for suspicious activity

    res.status(429).json({
      error: 'Too Many Authentication Attempts',
      message: 'Too many authentication attempts. Please wait before trying again.',
      retryAfter: '1 minute'
    });
  },
  // Skip rate limiting for successful requests (reduce false positives)
  skipSuccessfulRequests: false,
  // Skip rate limiting for certain IPs (e.g., internal services)
  skip: (req) => {
    // Skip rate limiting for localhost/internal requests during development
    const clientIP = req.ip || req.connection.remoteAddress;
    return clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.');
  }
});

// Rate limiter for API key endpoints (higher limit for legitimate API usage)
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 API key requests per minute
  message: {
    error: 'API Rate Limit Exceeded',
    message: 'Too many API requests. Please slow down your requests.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for admin dashboard operations (moderate limit)
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 admin operations per minute
  message: {
    error: 'Admin Rate Limit Exceeded',
    message: 'Too many admin operations. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for key management operations (strict, since these are sensitive)
const keyManagementLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 key management operations per minute
  message: {
    error: 'Key Management Rate Limit Exceeded',
    message: 'Too many key management operations. Please wait before trying again.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Key management rate limit exceeded: ${req.ip} - ${req.method} ${req.path}`);

    res.status(429).json({
      error: 'Key Management Rate Limit Exceeded',
      message: 'Too many key management operations. Please wait before trying again.',
      retryAfter: '1 minute'
    });
  }
});

// Create custom rate limiter factory for dynamic limits
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // 100 requests default
    message: options.message || {
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: `${Math.ceil((options.windowMs || 15 * 60 * 1000) / 60000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  apiKeyLimiter,
  adminLimiter,
  keyManagementLimiter,
  createRateLimiter
};
