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
    await connectDB();
    const server = app.listen(port, () => {
      // Server started successfully
    });

    // Scheduled publishing cron job - runs every minute
    cron.schedule("* * * * *", async () => {
      try {
        // Check if MongoDB is connected before executing database operations
        // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const isConnected = mongoose.connection.readyState === 1;

        if (!isConnected) {
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
      } catch (error) {
        console.error("Error in scheduled publishing:", error);
        // Note: No need to manually reset connection status - Mongoose handles this
      }
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await disconnectDB();
      server.close(() => {
        // HTTP server closed
      });
    });
  } catch (error) {
    console.error(
      "Failed to connect to MongoDB, server is not starting.",
      error,
    );
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
