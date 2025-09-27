const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// Generate cryptographic key pair for admin authentication
router.post("/keygen", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required for key generation",
      });
    }

    // Generate ECDSA P-256 key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "P-256",
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    // Convert public key to JWK format for storage
    const publicKeyJWK = crypto.createPublicKey(publicKey).export({
      format: "jwk",
    });

    // Store public key in database (you might want to associate it with the email)
    // For now, we'll just return the keys

    res.status(200).json({
      message: "Key pair generated successfully",
      privateKey: privateKey,
      publicKey: publicKeyJWK,
      email: email,
    });
  } catch (error) {
    console.error("Key generation error:", error);
    res.status(500).json({
      message: "Failed to generate cryptographic keys",
      error: error.message,
    });
  }
});

// Get admin status/keys (protected route)
router.get("/status", async (req, res) => {
  try {
    // This would check if admin is properly set up
    res.status(200).json({
      message: "Admin API is operational",
      status: "ready",
    });
  } catch (error) {
    console.error("Admin status error:", error);
    res.status(500).json({
      message: "Failed to get admin status",
      error: error.message,
    });
  }
});

module.exports = router;
