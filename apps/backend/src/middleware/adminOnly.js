const User = require("../models/User");

/**
 * Middleware to ensure only admin users with proper permissions can access routes
 * @param {Array} requiredPermissions - Array of required permissions (optional)
 * @returns {Function} Express middleware function
 */
const adminOnly = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      // Fetch user with permissions
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User not found",
        });
      }

      // Check if user is admin
      if (user.role !== "admin") {
        return res.status(403).json({
          error: "Forbidden",
          message: "Admin access required",
        });
      }

      // Check required permissions if specified
      if (requiredPermissions.length > 0) {
        const userPermissions = user.permissions || [];
        const hasAllPermissions = requiredPermissions.every((permission) =>
          userPermissions.includes(permission),
        );

        if (!hasAllPermissions) {
          return res.status(403).json({
            error: "Forbidden",
            message: `Missing required permissions: ${requiredPermissions.join(", ")}`,
          });
        }
      }

      // Add user to request for downstream middleware/routes
      req.user = {
        ...req.user,
        permissions: user.permissions || [],
      };

      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Authorization check failed",
      });
    }
  };
};

/**
 * Middleware for admin CRUD operations (create, read, update, delete)
 * Requires 'admin' permission
 */
const adminCrudOnly = adminOnly(["admin"]);

/**
 * Middleware for API key management
 * Requires 'api_access' permission
 */
const apiAccessOnly = adminOnly(["api_access"]);

/**
 * Middleware for audit log access
 * Requires 'admin' permission
 */
const auditAccessOnly = adminOnly(["admin"]);

module.exports = {
  adminOnly,
  adminCrudOnly,
  apiAccessOnly,
  auditAccessOnly,
};
