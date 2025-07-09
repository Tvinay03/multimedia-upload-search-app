const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configurations
const AppConfig = require('./config/app');
const DatabaseConfig = require('./config/database');
const CloudinaryConfig = require('./config/cloudinary');

const app = express();

// Validate configuration
const configValidation = AppConfig.validateConfig();
if (!configValidation.valid) {
  console.error('❌ Configuration validation failed:', configValidation.message);
  process.exit(1);
}

// Initialize configurations
CloudinaryConfig.configure();

// Connect to database
DatabaseConfig.connect();

// Get configurations
const serverConfig = AppConfig.getServerConfig();
const rateLimitConfig = AppConfig.getRateLimitConfig();
const securityConfig = AppConfig.getSecurityConfig();

// Security middleware
if (securityConfig.enableHelmet) {
  app.use(helmet());
}

// CORS configuration
if (securityConfig.enableCors) {
  app.use(cors({
    origin: serverConfig.corsOrigin,
    credentials: true
  }));
}

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Note: File upload is handled by multer middleware in routes, not globally

// Rate limiting
const limiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.maxRequests,
  message: {
    error: rateLimitConfig.message
  },
  standardHeaders: rateLimitConfig.standardHeaders,
  legacyHeaders: rateLimitConfig.legacyHeaders
});
app.use(limiter);

// Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  const dbStatus = DatabaseConfig.getConnectionStatus();
  const cloudinaryStatus = CloudinaryConfig.getConfigStatus();
  
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv,
    version: '1.0.0',
    status: {
      server: '✅ Running',
      database: `${dbStatus.state === 'connected' ? '✅' : '❌'} ${dbStatus.state}`,
      cloudinary: `${cloudinaryStatus.configured ? '✅' : '❌'} ${cloudinaryStatus.configured ? 'Connected' : 'Not configured'}`,
      environment: serverConfig.nodeEnv
    },
    config: {
      database: {
        host: dbStatus.host,
        name: dbStatus.name,
        state: dbStatus.state
      },
      cloudinary: cloudinaryStatus,
      server: {
        port: serverConfig.port,
        nodeEnv: serverConfig.nodeEnv
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Multimedia File Upload & Search API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      files: '/api/files',
      search: '/api/search',
      docs: '/api-docs'
    }
  });
});

// Swagger setup
const setupSwagger = require('./docs/swagger');
setupSwagger(app);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
