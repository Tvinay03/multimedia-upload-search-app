/**
 * Application configuration
 * Central configuration management for the application
 */
class AppConfig {
  
  /**
   * Get server configuration
   * @returns {Object} Server config
   */
  static getServerConfig() {
    return {
      port: process.env.PORT || 8000,
      nodeEnv: process.env.NODE_ENV || 'development',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    };
  }
  
  /**
   * Get JWT configuration
   * @returns {Object} JWT config
   */
  static getJWTConfig() {
    return {
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      expiry: process.env.JWT_EXPIRE || '7d',
      issuer: process.env.JWT_ISSUER || 'multimedia-app',
      audience: process.env.JWT_AUDIENCE || 'multimedia-app-users'
    };
  }
  
  /**
   * Get rate limiting configuration
   * @returns {Object} Rate limiting config
   */
  static getRateLimitConfig() {
    return {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    };
  }
  
  /**
   * Get file upload configuration
   * @returns {Object} File upload config
   */
  static getFileUploadConfig() {
    return {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/aac',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      tempDir: process.env.TEMP_DIR || '/tmp/',
      useTempFiles: true
    };
  }
  
  /**
   * Get database configuration
   * @returns {Object} Database config
   */
  static getDatabaseConfig() {
    return {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        family: 4
      }
    };
  }
  
  /**
   * Get logging configuration
   * @returns {Object} Logging config
   */
  static getLoggingConfig() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'combined',
      enableConsole: process.env.ENABLE_CONSOLE_LOG !== 'false',
      enableFile: process.env.ENABLE_FILE_LOG === 'true',
      logFile: process.env.LOG_FILE || 'logs/app.log'
    };
  }
  
  /**
   * Get security configuration
   * @returns {Object} Security config
   */
  static getSecurityConfig() {
    return {
      bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
      enableHelmet: process.env.ENABLE_HELMET !== 'false',
      enableCors: process.env.ENABLE_CORS !== 'false',
      trustedProxies: process.env.TRUSTED_PROXIES?.split(',') || []
    };
  }
  
  /**
   * Get pagination configuration
   * @returns {Object} Pagination config
   */
  static getPaginationConfig() {
    return {
      defaultLimit: parseInt(process.env.DEFAULT_PAGINATION_LIMIT) || 10,
      maxLimit: parseInt(process.env.MAX_PAGINATION_LIMIT) || 100,
      defaultPage: 1
    };
  }
  
  /**
   * Get search configuration
   * @returns {Object} Search config
   */
  static getSearchConfig() {
    return {
      defaultLimit: parseInt(process.env.SEARCH_DEFAULT_LIMIT) || 10,
      maxLimit: parseInt(process.env.SEARCH_MAX_LIMIT) || 50,
      suggestionsLimit: parseInt(process.env.SEARCH_SUGGESTIONS_LIMIT) || 5,
      popularTermsLimit: parseInt(process.env.SEARCH_POPULAR_TERMS_LIMIT) || 10,
      enableSearchAnalytics: process.env.ENABLE_SEARCH_ANALYTICS !== 'false'
    };
  }
  
  /**
   * Get email configuration (for future use)
   * @returns {Object} Email config
   */
  static getEmailConfig() {
    return {
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      from: process.env.EMAIL_FROM || 'noreply@multimedia-app.com',
      templates: {
        welcome: 'welcome.html',
        resetPassword: 'reset-password.html',
        accountActivation: 'account-activation.html'
      }
    };
  }
  
  /**
   * Validate required environment variables
   * @returns {Object} Validation result
   */
  static validateConfig() {
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing);
      return {
        valid: false,
        missing,
        message: `Missing required environment variables: ${missing.join(', ')}`
      };
    }
    
    console.log('✅ All required environment variables are set');
    return {
      valid: true,
      message: 'Configuration is valid'
    };
  }
  
  /**
   * Get complete application configuration
   * @returns {Object} Complete config
   */
  static getFullConfig() {
    return {
      server: this.getServerConfig(),
      jwt: this.getJWTConfig(),
      rateLimit: this.getRateLimitConfig(),
      fileUpload: this.getFileUploadConfig(),
      database: this.getDatabaseConfig(),
      logging: this.getLoggingConfig(),
      security: this.getSecurityConfig(),
      pagination: this.getPaginationConfig(),
      search: this.getSearchConfig(),
      email: this.getEmailConfig()
    };
  }
}

module.exports = AppConfig;
