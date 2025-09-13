const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./auth');

// Mock express request/response objects
const mockRequest = (headers = {}) => ({
  headers,
  user: null
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Authentication Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up test environment
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('authenticateToken', () => {
    it('should attach user data to request object for valid token', () => {
      // Create a valid JWT token
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        role: 'admin'
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      const req = mockRequest({
        authorization: `Bearer ${token}`
      });
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toEqual({
        userId: payload.userId,
        role: payload.role
      });
    });

    it('should return 401 for missing authorization header', () => {
      const req = mockRequest();
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed authorization header', () => {
      const req = mockRequest({
        authorization: 'InvalidFormat'
      });
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid JWT token', () => {
      const req = mockRequest({
        authorization: 'Bearer invalid.jwt.token'
      });
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for expired JWT token', () => {
      // Create an expired token
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        role: 'admin'
      };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1h' });

      const req = mockRequest({
        authorization: `Bearer ${expiredToken}`
      });
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for token signed with different secret', () => {
      // Create token with different secret
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        role: 'admin'
      };
      const token = jwt.sign(payload, 'different-secret');

      const req = mockRequest({
        authorization: `Bearer ${token}`
      });
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
