const { cleanEnv, str, url, port } = require("envalid");

/**
 * Environment variable validation using envalid
 * Validates all required environment variables for the blog application
 */
function validateEnvironment(options = {}) {
  const env = cleanEnv(process.env, {
    ...options,
    // Database Configuration
    MONGODB_URI: url({
      desc: "MongoDB Atlas connection string",
      example: "mongodb+srv://username:password@cluster.mongodb.net/blog", // pragma: allowlist secret
    }),

    // Authentication
    JWT_SECRET: str({
      desc: "JWT signing secret for authentication tokens",
      example: "your-super-secret-jwt-key-here",
    }),

    // Admin Configuration
    ADMIN_API_KEY: str({
      desc: "API key for admin operations",
      devDefault: "dev-only-admin-key",
      example: "admin-api-key-12345",
    }),

    // Server Configuration
    PORT: port({
      default: 3001,
      desc: "Port for the backend server",
      example: "3001",
    }),

    // Environment
    NODE_ENV: str({
      choices: ["development", "production", "test"],
      default: "development",
      desc: "Node.js environment",
    }),

    // Optional: Google OAuth (if implemented)
    GOOGLE_CLIENT_ID: str({
      default: "",
      desc: "Google OAuth client ID (optional)",
    }),

    GOOGLE_CLIENT_SECRET: str({
      default: "",
      desc: "Google OAuth client secret (optional)",
    }),
  });

  return env;
}

module.exports = { validateEnvironment };
