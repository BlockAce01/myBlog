const fs = require("fs").promises;
const path = require("path");

/**
 * IP Allowlisting middleware for enhanced security
 * Restricts access to admin endpoints based on IP address
 */

class IPAllowlist {
  constructor(options = {}) {
    this.allowlistFile =
      options.allowlistFile || path.join(process.cwd(), "ip-allowlist.json");
    this.enableAllowlist = options.enableAllowlist !== false;
    this.defaultAllowLocalhost = options.defaultAllowLocalhost !== false;
    this.cacheExpiry = options.cacheExpiry || 5 * 60 * 1000; // 5 minutes

    // Cache for allowlist to avoid file I/O on every request
    this.allowlistCache = null;
    this.cacheTimestamp = null;

    // Initialize allowlist if it doesn't exist
    this.initializeAllowlist();
  }

  async initializeAllowlist() {
    try {
      await fs.access(this.allowlistFile);
    } catch (error) {
      // File doesn't exist, create default allowlist
      const defaultAllowlist = {
        enabled: this.enableAllowlist,
        allowLocalhost: this.defaultAllowLocalhost,
        allowedIPs: this.defaultAllowLocalhost ? ["127.0.0.1", "::1"] : [],
        allowedCIDRs: [],
        blockedIPs: [],
        lastUpdated: new Date().toISOString(),
        description: "IP allowlist for admin endpoints - automatically created",
      };

      await fs.writeFile(
        this.allowlistFile,
        JSON.stringify(defaultAllowlist, null, 2),
      );
      console.log("Created default IP allowlist file:", this.allowlistFile);
    }
  }

  /**
   * Check if an IP address is allowed
   * @param {string} ip - IP address to check
   * @returns {Promise<boolean>} - True if allowed, false if blocked
   */
  async isAllowed(ip) {
    if (!this.enableAllowlist) {
      return true; // Allowlist disabled, allow all
    }

    const allowlist = await this.getAllowlist();

    // Check blocked IPs first
    if (allowlist.blockedIPs.includes(ip)) {
      return false;
    }

    // If no allowed IPs/CIDRs specified, deny all (secure by default)
    if (
      allowlist.allowedIPs.length === 0 &&
      allowlist.allowedCIDRs.length === 0
    ) {
      return false;
    }

    // Check exact IP matches
    if (allowlist.allowedIPs.includes(ip)) {
      return true;
    }

    // Check CIDR ranges
    for (const cidr of allowlist.allowedCIDRs) {
      if (this.isIPInCIDR(ip, cidr)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if IP is within CIDR range
   * @param {string} ip - IP address
   * @param {string} cidr - CIDR notation (e.g., "192.168.1.0/24")
   * @returns {boolean}
   */
  isIPInCIDR(ip, cidr) {
    try {
      const [network, prefixLength] = cidr.split("/");
      const prefix = parseInt(prefixLength);

      // Convert IP and network to binary
      const ipBinary = this.ipToBinary(ip);
      const networkBinary = this.ipToBinary(network);

      if (!ipBinary || !networkBinary) return false;

      // Compare the network portion
      const networkBits = networkBinary.substring(0, prefix);
      const ipBits = ipBinary.substring(0, prefix);

      return networkBits === ipBits;
    } catch (error) {
      console.error("Error checking CIDR:", error);
      return false;
    }
  }

  /**
   * Convert IP address to binary string
   * @param {string} ip - IP address
   * @returns {string|null} - Binary representation or null if invalid
   */
  ipToBinary(ip) {
    // Handle IPv4
    if (ip.includes(".")) {
      const parts = ip.split(".");
      if (parts.length !== 4) return null;

      return parts
        .map((part) => {
          const num = parseInt(part);
          if (isNaN(num) || num < 0 || num > 255) return null;
          return num.toString(2).padStart(8, "0");
        })
        .join("");
    }

    // Handle IPv6 (simplified - only handle compressed form)
    if (ip.includes(":")) {
      // For simplicity, convert IPv4-mapped IPv6 addresses
      if (ip.startsWith("::ffff:")) {
        const ipv4 = ip.substring(7);
        return this.ipToBinary(ipv4);
      }
      // For full IPv6 support, would need more complex logic
      return null;
    }

    return null;
  }

  /**
   * Get the current allowlist (with caching)
   * @returns {Promise<Object>} - Allowlist configuration
   */
  async getAllowlist() {
    const now = Date.now();

    // Return cached version if still valid
    if (
      this.allowlistCache &&
      this.cacheTimestamp &&
      now - this.cacheTimestamp < this.cacheExpiry
    ) {
      return this.allowlistCache;
    }

    try {
      const data = await fs.readFile(this.allowlistFile, "utf8");
      const allowlist = JSON.parse(data);

      // Update cache
      this.allowlistCache = allowlist;
      this.cacheTimestamp = now;

      return allowlist;
    } catch (error) {
      console.error("Error reading IP allowlist:", error);
      // Return secure defaults on error
      return {
        enabled: true,
        allowLocalhost: this.defaultAllowLocalhost,
        allowedIPs: this.defaultAllowLocalhost ? ["127.0.0.1", "::1"] : [],
        allowedCIDRs: [],
        blockedIPs: [],
      };
    }
  }

  /**
   * Update the allowlist
   * @param {Object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  async updateAllowlist(updates) {
    try {
      const current = await this.getAllowlist();
      const updated = {
        ...current,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };

      await fs.writeFile(this.allowlistFile, JSON.stringify(updated, null, 2));

      // Clear cache to force reload
      this.allowlistCache = null;
      this.cacheTimestamp = null;

      console.log("IP allowlist updated successfully");
    } catch (error) {
      console.error("Error updating IP allowlist:", error);
      throw error;
    }
  }

  /**
   * Add IP to allowlist
   * @param {string} ip - IP address to add
   * @param {string} description - Optional description
   * @returns {Promise<void>}
   */
  async addAllowedIP(ip, description = "") {
    const allowlist = await this.getAllowlist();

    if (!allowlist.allowedIPs.includes(ip)) {
      allowlist.allowedIPs.push(ip);

      if (description) {
        allowlist.descriptions = allowlist.descriptions || {};
        allowlist.descriptions[ip] = description;
      }

      await this.updateAllowlist(allowlist);
    }
  }

  /**
   * Remove IP from allowlist
   * @param {string} ip - IP address to remove
   * @returns {Promise<void>}
   */
  async removeAllowedIP(ip) {
    const allowlist = await this.getAllowlist();

    const index = allowlist.allowedIPs.indexOf(ip);
    if (index > -1) {
      allowlist.allowedIPs.splice(index, 1);

      if (allowlist.descriptions) {
        delete allowlist.descriptions[ip];
      }

      await this.updateAllowlist(allowlist);
    }
  }

  /**
   * Get allowlist statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    const allowlist = await this.getAllowlist();

    return {
      enabled: allowlist.enabled,
      totalAllowedIPs: allowlist.allowedIPs.length,
      totalAllowedCIDRs: allowlist.allowedCIDRs.length,
      totalBlockedIPs: allowlist.blockedIPs.length,
      lastUpdated: allowlist.lastUpdated,
      allowLocalhost: allowlist.allowLocalhost,
    };
  }
}

// Create singleton instance
const ipAllowlist = new IPAllowlist();

/**
 * Express middleware for IP allowlisting
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware
 */
const ipAllowlistMiddleware = (options = {}) => {
  const allowlist = options.allowlist || ipAllowlist;
  const exemptRoutes = options.exemptRoutes || [];
  const logViolations = options.logViolations !== false;

  return async (req, res, next) => {
    try {
      // Skip allowlist check for exempt routes
      if (exemptRoutes.some((route) => req.path.startsWith(route))) {
        return next();
      }

      // Get client IP (handle proxies)
      const clientIP =
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

      if (!clientIP) {
        if (logViolations) {
          console.warn(
            "IP allowlist: Unable to determine client IP for request:",
            req.method,
            req.path,
          );
        }
        return res.status(403).json({
          error: "Forbidden",
          message: "Unable to verify client identity",
        });
      }

      // Check if IP is allowed
      const allowed = await allowlist.isAllowed(clientIP);

      if (!allowed) {
        if (logViolations) {
          console.warn(
            `IP allowlist violation: ${clientIP} attempted access to ${req.method} ${req.path}`,
          );

          // Could integrate with audit logger here
          const { audit } = require("../utils/auditLogger");
          await audit.logSuspiciousActivity(
            clientIP,
            "ip_allowlist_violation",
            {
              path: req.path,
              method: req.method,
              userAgent: req.get("User-Agent"),
            },
          );
        }

        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied from this IP address",
        });
      }

      // Add IP info to request for downstream use
      req.clientIP = clientIP;
      req.ipAllowed = true;

      next();
    } catch (error) {
      console.error("IP allowlist middleware error:", error);
      // Fail open for errors to avoid blocking legitimate users
      next();
    }
  };
};

module.exports = {
  IPAllowlist,
  ipAllowlist,
  ipAllowlistMiddleware,
};
