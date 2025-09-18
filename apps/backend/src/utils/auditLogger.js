const fs = require('fs').promises;
const path = require('path');

/**
 * Comprehensive audit logging system for security events
 * Supports multiple storage backends and structured logging
 */

class AuditLogger {
  constructor(options = {}) {
    // Use environment variable for log file path, fallback to default
    this.logFile = options.logFile || process.env.AUDIT_LOG_FILE || 'audit.log';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.logLevel = options.logLevel || 'info';
    this.enableConsole = options.enableConsole !== false;
    // Allow disabling file logging in production for security
    this.enableFile = options.enableFile !== false && process.env.DISABLE_AUDIT_FILE_LOGGING !== 'true';

    // Create logs directory if it doesn't exist
    this.logsDir = path.dirname(this.logFile);
    this.ensureLogsDirectory();
  }

  async ensureLogsDirectory() {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create audit logs directory:', error);
    }
  }

  // Log levels
  static LEVELS = {
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
  };

  // Event categories
  static CATEGORIES = {
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    ADMIN_ACTION: 'admin_action',
    API_ACCESS: 'api_access',
    SECURITY: 'security',
    SYSTEM: 'system'
  };

  // Event types
  static EVENTS = {
    // Authentication events
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILURE: 'login_failure',
    LOGOUT: 'logout',
    PASSWORD_CHANGE: 'password_change',
    KEY_GENERATION: 'key_generation',
    KEY_ROTATION: 'key_rotation',

    // Authorization events
    PERMISSION_DENIED: 'permission_denied',
    ADMIN_ACCESS: 'admin_access',
    ROLE_CHANGE: 'role_change',

    // Admin actions
    POST_CREATE: 'post_create',
    POST_UPDATE: 'post_update',
    POST_DELETE: 'post_delete',
    USER_MANAGEMENT: 'user_management',
    SETTINGS_CHANGE: 'settings_change',

    // API events
    API_KEY_CREATED: 'api_key_created',
    API_KEY_DELETED: 'api_key_deleted',
    API_ACCESS: 'api_access',
    WEBHOOK_RECEIVED: 'webhook_received',

    // Security events
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    IP_BLOCKED: 'ip_blocked',
    BRUTE_FORCE_DETECTED: 'brute_force_detected',

    // System events
    SYSTEM_STARTUP: 'system_startup',
    SYSTEM_SHUTDOWN: 'system_shutdown',
    CONFIG_CHANGE: 'config_change'
  };

  /**
   * Log an audit event
   * @param {string} event - Event type
   * @param {string} category - Event category
   * @param {Object} details - Event details
   * @param {Object} context - Request context (user, ip, etc.)
   */
  async log(event, category, details = {}, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      category,
      level: this.getEventLevel(event),
      details,
      context: {
        userId: context.userId || null,
        userEmail: context.userEmail || null,
        ip: context.ip || null,
        userAgent: context.userAgent || null,
        sessionId: context.sessionId || null,
        apiKeyId: context.apiKeyId || null,
        ...context
      },
      id: this.generateEventId()
    };

    // Log to console if enabled
    if (this.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Log to file if enabled
    if (this.enableFile) {
      await this.logToFile(logEntry);
    }

    // Emit event for real-time monitoring (if implemented)
    this.emitEvent(logEntry);

    return logEntry.id;
  }

  /**
   * Get appropriate log level for event type
   */
  getEventLevel(event) {
    const criticalEvents = [
      AuditLogger.EVENTS.BRUTE_FORCE_DETECTED,
      AuditLogger.EVENTS.IP_BLOCKED,
      AuditLogger.EVENTS.SUSPICIOUS_ACTIVITY
    ];

    const errorEvents = [
      AuditLogger.EVENTS.LOGIN_FAILURE,
      AuditLogger.EVENTS.PERMISSION_DENIED,
      AuditLogger.EVENTS.RATE_LIMIT_EXCEEDED
    ];

    const warningEvents = [
      AuditLogger.EVENTS.KEY_ROTATION,
      AuditLogger.EVENTS.ROLE_CHANGE
    ];

    if (criticalEvents.includes(event)) return 'critical';
    if (errorEvents.includes(event)) return 'error';
    if (warningEvents.includes(event)) return 'warning';
    return 'info';
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log to console with appropriate formatting
   */
  logToConsole(logEntry) {
    const level = logEntry.level.toUpperCase();
    const color = this.getLogColor(level);

    console.log(
      `${color}[${level}] ${logEntry.timestamp} ${logEntry.category}:${logEntry.event}${this.resetColor}`,
      JSON.stringify({
        id: logEntry.id,
        details: logEntry.details,
        context: logEntry.context
      }, null, 2)
    );
  }

  /**
   * Get ANSI color code for log level
   */
  getLogColor(level) {
    const colors = {
      emergency: '\x1b[35m', // Magenta
      alert: '\x1b[35m',     // Magenta
      critical: '\x1b[31m',  // Red
      error: '\x1b[31m',     // Red
      warning: '\x1b[33m',   // Yellow
      notice: '\x1b[36m',    // Cyan
      info: '\x1b[32m',      // Green
      debug: '\x1b[37m'      // White
    };
    return colors[level] || '\x1b[37m';
  }

  get resetColor() {
    return '\x1b[0m';
  }

  /**
   * Log to file with rotation
   */
  async logToFile(logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';

      // Check if file needs rotation
      await this.rotateLogFileIfNeeded();

      // Append to current log file
      await fs.appendFile(this.logFile, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Rotate log file if it exceeds max size
   */
  async rotateLogFileIfNeeded() {
    try {
      const stats = await fs.stat(this.logFile);
      if (stats.size >= this.maxFileSize) {
        await this.rotateLogFile();
      }
    } catch (error) {
      // File doesn't exist yet, no rotation needed
    }
  }

  /**
   * Perform log file rotation
   */
  async rotateLogFile() {
    try {
      // Move current log file to backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `${this.logFile}.${timestamp}`;

      await fs.rename(this.logFile, backupFile);

      // Remove old log files if we exceed maxFiles
      await this.cleanupOldLogFiles();
    } catch (error) {
      console.error('Failed to rotate audit log:', error);
    }
  }

  /**
   * Remove old log files beyond maxFiles limit
   */
  async cleanupOldLogFiles() {
    try {
      const files = await fs.readdir(this.logsDir);
      const logFiles = files
        .filter(file => file.startsWith(path.basename(this.logFile)) && file !== path.basename(this.logFile))
        .sort()
        .reverse(); // Most recent first

      if (logFiles.length >= this.maxFiles) {
        const filesToDelete = logFiles.slice(this.maxFiles - 1);
        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.logsDir, file));
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
    }
  }

  /**
   * Emit event for real-time monitoring systems
   */
  emitEvent(logEntry) {
    // This could be extended to emit events to monitoring systems
    // like Elasticsearch, Splunk, or custom monitoring dashboards
    if (global.auditEventEmitter) {
      global.auditEventEmitter.emit('audit-event', logEntry);
    }
  }

  /**
   * Query audit logs with filters
   */
  async queryLogs(filters = {}) {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const lines = content.trim().split('\n');
      let logs = lines.map(line => JSON.parse(line));

      // Apply filters
      if (filters.category) {
        logs = logs.filter(log => log.category === filters.category);
      }
      if (filters.event) {
        logs = logs.filter(log => log.event === filters.event);
      }
      if (filters.userId) {
        logs = logs.filter(log => log.context.userId === filters.userId);
      }
      if (filters.ip) {
        logs = logs.filter(log => log.context.ip === filters.ip);
      }
      if (filters.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
      }

      // Sort by timestamp (most recent first)
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return logs;
    } catch (error) {
      console.error('Failed to query audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  async getStats(timeframe = '24h') {
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const logs = await this.queryLogs({ startDate: startDate.toISOString() });

    const stats = {
      totalEvents: logs.length,
      byCategory: {},
      byEvent: {},
      byLevel: {},
      recentEvents: logs.slice(0, 10)
    };

    logs.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      stats.byEvent[log.event] = (stats.byEvent[log.event] || 0) + 1;
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    return stats;
  }
}

// Convenience methods for common audit events
const auditLogger = new AuditLogger();

const audit = {
  // Authentication events
  logLoginSuccess: (userId, email, ip, userAgent) =>
    auditLogger.log(AuditLogger.EVENTS.LOGIN_SUCCESS, AuditLogger.CATEGORIES.AUTHENTICATION,
      { method: 'cryptographic' }, { userId, userEmail: email, ip, userAgent }),

  logLoginFailure: (email, ip, reason) =>
    auditLogger.log(AuditLogger.EVENTS.LOGIN_FAILURE, AuditLogger.CATEGORIES.AUTHENTICATION,
      { reason }, { userEmail: email, ip }),

  logLogout: (userId, email, ip) =>
    auditLogger.log(AuditLogger.EVENTS.LOGOUT, AuditLogger.CATEGORIES.AUTHENTICATION,
      {}, { userId, userEmail: email, ip }),

  // Authorization events
  logPermissionDenied: (userId, email, ip, resource, action) =>
    auditLogger.log(AuditLogger.EVENTS.PERMISSION_DENIED, AuditLogger.CATEGORIES.AUTHORIZATION,
      { resource, action }, { userId, userEmail: email, ip }),

  logAdminAccess: (userId, email, ip, action) =>
    auditLogger.log(AuditLogger.EVENTS.ADMIN_ACCESS, AuditLogger.CATEGORIES.AUTHORIZATION,
      { action }, { userId, userEmail: email, ip }),

  // Admin actions
  logPostCreate: (userId, email, ip, postId) =>
    auditLogger.log(AuditLogger.EVENTS.POST_CREATE, AuditLogger.CATEGORIES.ADMIN_ACTION,
      { postId }, { userId, userEmail: email, ip }),

  logPostUpdate: (userId, email, ip, postId) =>
    auditLogger.log(AuditLogger.EVENTS.POST_UPDATE, AuditLogger.CATEGORIES.ADMIN_ACTION,
      { postId }, { userId, userEmail: email, ip }),

  logPostDelete: (userId, email, ip, postId) =>
    auditLogger.log(AuditLogger.EVENTS.POST_DELETE, AuditLogger.CATEGORIES.ADMIN_ACTION,
      { postId }, { userId, userEmail: email, ip }),

  // API events
  logApiKeyCreated: (userId, email, ip, keyId, permissions) =>
    auditLogger.log(AuditLogger.EVENTS.API_KEY_CREATED, AuditLogger.CATEGORIES.API_ACCESS,
      { keyId, permissions }, { userId, userEmail: email, ip }),

  logApiAccess: (keyId, ip, endpoint, method) =>
    auditLogger.log(AuditLogger.EVENTS.API_ACCESS, AuditLogger.CATEGORIES.API_ACCESS,
      { endpoint, method }, { apiKeyId: keyId, ip }),

  // Security events
  logRateLimitExceeded: (ip, endpoint, limit) =>
    auditLogger.log(AuditLogger.EVENTS.RATE_LIMIT_EXCEEDED, AuditLogger.CATEGORIES.SECURITY,
      { endpoint, limit }, { ip }),

  logSuspiciousActivity: (ip, reason, details) =>
    auditLogger.log(AuditLogger.EVENTS.SUSPICIOUS_ACTIVITY, AuditLogger.CATEGORIES.SECURITY,
      { reason, details }, { ip }),

  // Key management events
  logKeyRegistration: (userId, ip, type) =>
    auditLogger.log(AuditLogger.EVENTS.KEY_GENERATION, AuditLogger.CATEGORIES.SECURITY,
      { type }, { userId, ip }),

  logKeyRotation: (userId, ip, type) =>
    auditLogger.log(AuditLogger.EVENTS.KEY_ROTATION, AuditLogger.CATEGORIES.SECURITY,
      { type }, { userId, ip }),

  logKeyRotationFailure: (userId, ip, reason) =>
    auditLogger.log(AuditLogger.EVENTS.LOGIN_FAILURE, AuditLogger.CATEGORIES.SECURITY,
      { reason, context: 'key_rotation' }, { userId, ip }),

  // Query methods
  queryLogs: (filters) => auditLogger.queryLogs(filters),
  getStats: (timeframe) => auditLogger.getStats(timeframe)
};

module.exports = {
  AuditLogger,
  audit
};
