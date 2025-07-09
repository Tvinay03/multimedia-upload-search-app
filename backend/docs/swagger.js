/**
 * Swagger API Documentation Configuration
 * Centralized documentation setup for the multimedia API
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger configuration options
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multimedia File Upload & Search API',
      version: '1.0.0',
      description: `
        A comprehensive Node.js backend API for uploading, managing, and searching multimedia files 
        with JWT authentication, Cloudinary integration, and advanced search capabilities.
        
        ## Features
        - User authentication with JWT
        - File upload to Cloudinary
        - Advanced search with ranking
        - File management and statistics
        - Secure API with rate limiting
        
        ## Authentication
        Most endpoints require a JWT token. Include it in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Base URL
        - Development: \`http://localhost:5000\`
        - Production: \`https://your-api-domain.com\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@multimedia-app.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-api-domain.com' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint'
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User\'s full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL'
            },
            totalFiles: {
              type: 'number',
              description: 'Total number of files uploaded'
            },
            storageUsed: {
              type: 'number',
              description: 'Total storage used in bytes'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user account is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // File Schemas
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'File ID'
            },
            title: {
              type: 'string',
              description: 'File title'
            },
            description: {
              type: 'string',
              description: 'File description'
            },
            originalName: {
              type: 'string',
              description: 'Original filename'
            },
            fileName: {
              type: 'string',
              description: 'Stored filename'
            },
            fileType: {
              type: 'string',
              enum: ['image', 'video', 'audio', 'document'],
              description: 'Type of file'
            },
            mimeType: {
              type: 'string',
              description: 'MIME type of the file'
            },
            size: {
              type: 'number',
              description: 'File size in bytes'
            },
            url: {
              type: 'string',
              description: 'File URL'
            },
            secureUrl: {
              type: 'string',
              description: 'Secure file URL'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'File tags'
            },
            category: {
              type: 'string',
              enum: ['personal', 'work', 'education', 'entertainment', 'other'],
              description: 'File category'
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether the file is public'
            },
            viewCount: {
              type: 'number',
              description: 'Number of views'
            },
            downloadCount: {
              type: 'number',
              description: 'Number of downloads'
            },
            uploadedBy: {
              type: 'string',
              description: 'User ID who uploaded the file'
            },
            metadata: {
              type: 'object',
              description: 'File metadata from Cloudinary'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // Pagination Schema
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'number'
            },
            totalPages: {
              type: 'number'
            },
            totalFiles: {
              type: 'number'
            },
            hasNext: {
              type: 'boolean'
            },
            hasPrev: {
              type: 'boolean'
            },
            limit: {
              type: 'number'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

/**
 * Swagger UI configuration
 */
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 30px 0 }
  `,
  customSiteTitle: 'Multimedia API Documentation',
  customfavIcon: '/favicon.ico'
};

/**
 * Setup Swagger documentation
 * @param {Object} app - Express app instance
 */
function setupSwagger(app) {
  try {
    const specs = swaggerJsdoc(swaggerOptions);
    
    // Serve swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
    
    // Serve swagger JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });
    
    console.log('✅ Swagger documentation setup complete');
    console.log('📖 API Documentation: http://localhost:5000/api-docs');
    
  } catch (error) {
    console.error('❌ Swagger setup failed:', error);
  }
}

module.exports = setupSwagger;
