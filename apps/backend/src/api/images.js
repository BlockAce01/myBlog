const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const { authenticateToken } = require("../middleware/auth");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/images");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// POST /api/images/upload - Upload image for blog post content
router.post(
  "/upload",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image file provided",
          error: true,
        });
      }

      // Create public URL for the image
      const imageUrl = `/uploads/images/${req.file.filename}`;

      res.status(201).json({
        message: "Image uploaded successfully",
        imageUrl: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({
        message: "Server error: " + error.message,
        error: true,
      });
    }
  },
);

// DELETE /api/images/:filename - Delete uploaded image
router.delete("/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../../uploads/images", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        message: "Image file not found",
        error: true,
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    res.status(200).json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      message: "Server error: " + error.message,
      error: true,
    });
  }
});

// GET /api/images - List uploaded images (for admin)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, "../../uploads/images");

    try {
      const files = await fs.readdir(uploadDir);
      const images = files.map((filename) => ({
        filename,
        url: `/uploads/images/${filename}`,
        path: path.join(uploadDir, filename),
      }));

      res.status(200).json(images);
    } catch {
      // Directory doesn't exist yet
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error listing images:", error);
    res.status(500).json({
      message: "Server error: " + error.message,
      error: true,
    });
  }
});

module.exports = router;
