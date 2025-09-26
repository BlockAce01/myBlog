require("dotenv").config();
const { validateEnvironment } = require("./utils/env-validation");

// Validate environment variables at startup
const env = validateEnvironment();

const express = require("express");
const cron = require("node-cron");
const passport = require("passport");
const { connectDB, disconnectDB } = require("./utils/db");
const mongoose = require("mongoose");
const helloRouter = require("./api/hello");
const postsRouter = require("./api/posts");
const imagesRouter = require("./api/images");
const analyticsRouter = require("./api/analytics");
const authRouter = require("./api/auth/auth"); // Import auth router
const adminAuthRouter = require("./api/auth/admin-auth"); // Import admin auth router
const BlogPost = require("./models/BlogPost");
require("./models/Comment");
require("./models/User"); // Ensure User model is loaded

const app = express(); // Moved this line up

const helmet = require("helmet"); // Import helmet
const cors = require("cors");
const path = require("path");
const session = require("express-session"); // Moved this line up

// Initialize Passport
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true in production with HTTPS
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());

// Add Helmet middleware with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "www.gstatic.com",
          "accounts.google.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "www.gstatic.com"],
        imgSrc: ["'self'", "data:", "www.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://accounts.google.com",
          "http://localhost:3003",
        ],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  }),
);
const port = process.env.PORT || 3003;

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/hello", helloRouter);
app.use("/api", postsRouter);
app.use("/api/images", imagesRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/auth", authRouter); // Use auth router
app.use("/api/admin", adminAuthRouter); // Use admin auth router

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const startServer = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected successfully");

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Scheduled publishing cron job - runs every minute
    cron.schedule("* * * * *", async () => {
      try {
        // Check if MongoDB is connected before executing database operations
        // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const isConnected = mongoose.connection.readyState === 1;

        if (!isConnected) {
          console.log("MongoDB not connected, skipping scheduled publishing");
          return;
        }

        const now = new Date();
        const result = await BlogPost.updateMany(
          {
            status: "scheduled",
            scheduledPublishDate: { $lte: now },
          },
          {
            $set: { status: "published" },
            $unset: { scheduledPublishDate: 1 },
          },
        );
        if (result.modifiedCount > 0) {
          console.log(`Published ${result.modifiedCount} scheduled posts`);
        }
      } catch (error) {
        console.error("Error in scheduled publishing:", error);
        // Note: No need to manually reset connection status - Mongoose handles this
      }
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Received SIGINT, shutting down gracefully...");
      await disconnectDB();
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    console.error("MongoDB URI:", process.env.MONGODB_URI ? "Set" : "Not set");
    console.error("Starting server in degraded mode (without database)...");

    // Start server even without DB connection for health checks
    const server = app.listen(port, () => {
      console.log(
        `🚀 Server running on port ${port} (degraded mode - no database)`,
      );
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("Shutting down server...");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
