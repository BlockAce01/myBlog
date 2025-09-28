const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../models/User");
require("dotenv").config();

// Configure Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.NODE_ENV === "production" ? process.env.PROD_URL : "http://localhost:3003"}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔐 Google OAuth strategy - Profile:", {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
        });

        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        console.log("🔐 Existing user check result:", !!user);

        if (user) {
          console.log("🔐 Updating existing user:", user._id);
          // Update user info if needed
          user.name = profile.displayName;
          user.email = profile.emails[0].value;
          user.profilePicture = profile.photos[0].value;
          await user.save();
          console.log("🔐 Existing user updated successfully");
          return done(null, user);
        }

        // Check if user exists with same email (admin user)
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });
        console.log("🔐 Email check result:", !!existingUser);

        if (existingUser) {
          console.log("🔐 Linking Google account to existing user:", existingUser._id);
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          existingUser.name = profile.displayName;
          existingUser.profilePicture = profile.photos[0].value;
          existingUser.role = "admin"; // Keep admin role
          await existingUser.save();
          console.log("🔐 Google account linked successfully");
          return done(null, existingUser);
        }

        // Create new user
        console.log("🔐 Creating new user for email:", profile.emails[0].value);
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          role: "user",
        });

        console.log("🔐 New user object:", {
          googleId: newUser.googleId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        });

        const savedUser = await newUser.save();
        console.log("🔐 New user created successfully with ID:", savedUser._id);
        return done(null, savedUser);
      } catch (error) {
        console.error("❌ Google OAuth strategy error:", error);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
        return done(error, null);
      }
    },
  ),
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Auth service
router.get("/", (req, res) => {
  res.status(200).json({ message: "Auth service endpoint" });
});

// Register new admin user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email, and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this username or email already exists",
      });
    }

    // Create new user
    const newUser = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // Will be hashed by pre-save middleware
      role: "admin",
    });

    await newUser.save();

    res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      userId: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth routes
router.get("/google", (req, res, next) => {
  // Pass callbackUrl as state parameter for OAuth flow
  const state = req.query.callbackUrl || "/";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      console.log("🔐 Google OAuth callback - User object:", req.user);
      console.log("🔐 Request query:", req.query);

      // Check if user exists
      if (!req.user) {
        console.error("❌ No user object in request");
        return res.redirect("/login?error=no_user");
      }

      if (!req.user._id) {
        console.error("❌ User object missing _id:", req.user);
        return res.redirect("/login?error=invalid_user");
      }

      // Generate JWT token for the authenticated user
      const payload = {
        userId: req.user._id,
        role: req.user.role || "user",
      };

      console.log("🔐 Creating JWT payload:", payload);

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log("🔐 JWT token created successfully");

      // Redirect to frontend with token
      const frontendUrl =
        process.env.NODE_ENV === "production"
          ? process.env.PROD_URL
          : "http://localhost:3000";

      console.log("🔐 Frontend URL:", frontendUrl);

      const redirectPath = req.query.state || "/"; // Retrieve callbackUrl from OAuth state

      console.log("🔐 Redirect path:", redirectPath);

      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&callbackUrl=${encodeURIComponent(redirectPath)}`;
      console.log("🔐 Final redirect URL:", redirectUrl);

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Google OAuth callback error:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Stack trace:", error.stack);
      res.redirect("/login?error=oauth_callback_failed");
    }
  },
);

// Get current user info
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  // For stateless JWT, logout is handled on frontend by removing token
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
