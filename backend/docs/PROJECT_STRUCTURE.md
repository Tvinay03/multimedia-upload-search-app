# Multimedia Backend - Project Structure Documentation

## 📂 Directory Structure

```
backend/
├── 📁 config/                  # Configuration files
│   ├── app.js                 # Application configuration
│   ├── cloudinary.js         # Cloudinary configuration  
│   └── database.js           # Database configuration
│
├── 📁 controllers/            # Request handlers (MVC Controllers)
│   ├── BaseController.js     # Base controller with common functionality
│   ├── AuthController.js     # Authentication endpoints
│   ├── FileController.js     # File management endpoints
│   └── SearchController.js   # Search endpoints
│
├── 📁 docs/                   # Documentation
│   ├── swagger.js            # Swagger/OpenAPI configuration
│   └── PROJECT_STRUCTURE.md  # This file
│
├── 📁 middleware/             # Express middleware
│   ├── auth.js               # JWT authentication middleware
│   └── validation.js         # Input validation middleware
│
├── 📁 models/                 # Database models (Mongoose schemas)
│   ├── User.js               # User model
│   └── File.js               # File model
│
├── 📁 routes/                 # API route definitions
│   ├── auth.js               # Authentication routes
│   ├── files.js              # File management routes
│   ├── search.js             # Search routes
│   └── index.js              # Main routes aggregator
│
├── 📁 services/               # Business logic layer
│   ├── AuthService.js        # Authentication business logic
│   ├── CloudinaryService.js  # Cloudinary operations
│   ├── FileService.js        # File management business logic
│   └── SearchService.js      # Search operations
│
├── 📁 utils/                  # Utility functions
│   └── helpers.js            # Helper functions
│
├── 📄 app.js                  # Express application setup
├── 📄 server.js              # Server startup
├── 📄 .env                   # Environment variables
├── 📄 .env.example           # Environment variables template
├── 📄 .gitignore             # Git ignore rules
├── 📄 package.json           # Project dependencies
└── 📄 README.md              # Project documentation
```

## 🏗️ Architecture Overview

### MVC + Services Pattern

This project follows a **Model-View-Controller (MVC)** pattern enhanced with a **Services layer** for better separation of concerns:

#### 📊 **Models** (`/models/`)
- Define database schemas using Mongoose
- Handle data validation and relationships
- Contain model-specific methods and middleware
- Examples: `User.js`, `File.js`

#### 🎮 **Controllers** (`/controllers/`)
- Handle HTTP requests and responses
- Validate input and format output
- Call appropriate service methods
- Keep business logic minimal
- Examples: `AuthController.js`, `FileController.js`

#### 🛠️ **Services** (`/services/`)
- Contain business logic and complex operations
- Handle data processing and external API calls
- Can be reused across multiple controllers
- Examples: `CloudinaryService.js`, `SearchService.js`

#### 🛣️ **Routes** (`/routes/`)
- Define API endpoints and HTTP methods
- Apply middleware (authentication, validation)
- Map routes to controller methods
- Contain Swagger documentation
- Examples: `auth.js`, `files.js`

### 📡 **Request Flow**

```
Client Request
    ↓
📡 Route (auth.js)
    ↓
🛡️ Middleware (auth, validation)
    ↓
🎮 Controller (AuthController.js)
    ↓
🛠️ Service (AuthService.js)
    ↓
📊 Model (User.js)
    ↓
🗄️ Database (MongoDB)
    ↓
🌩️ External APIs (Cloudinary)
    ↓
📤 Response to Client
```

## 🔧 Configuration Management

### Centralized Configuration (`/config/`)

- **`app.js`**: Application-wide settings (JWT, rate limiting, file upload)
- **`database.js`**: MongoDB connection and management
- **`cloudinary.js`**: Cloudinary service configuration

### Environment Variables
- All sensitive data stored in `.env`
- Configuration validation on startup
- Different settings for development/production

## 🛡️ Security & Middleware

### Authentication Flow
1. User registers/logs in → JWT token issued
2. Token stored by client (localStorage/cookies)
3. Token sent in Authorization header
4. `auth.js` middleware validates token
5. `req.user` populated for protected routes

### Validation
- Input validation using `express-validator`
- File type and size validation
- Sanitization of user inputs

## 📁 File Upload Architecture

### Upload Process
```
Client → Upload Request
    ↓
FileController → Validates file
    ↓
FileService → Processes metadata
    ↓
CloudinaryService → Uploads to cloud
    ↓
Database → Stores file record
    ↓
Response → Returns file details
```

### File Management
- Cloudinary for cloud storage
- MongoDB for metadata
- File type detection and categorization
- View count and statistics tracking

## 🔍 Search Architecture

### Search Features
- **Text Search**: Full-text search across file metadata
- **Filtering**: By file type, category, user ownership
- **Ranking**: Relevance scoring algorithm
- **Suggestions**: Auto-complete based on existing content
- **Popular Terms**: Trending search terms

### Search Flow
```
Search Query
    ↓
SearchController → Validates parameters
    ↓
SearchService → Builds search pipeline
    ↓
MongoDB Aggregation → Complex queries
    ↓
Ranking Algorithm → Scores results
    ↓
Paginated Results → Returns to client
```

## 📚 API Documentation

### Swagger Integration
- Comprehensive API documentation
- Interactive testing interface
- Schema definitions for all models
- Example requests and responses
- Available at `/api-docs`

### Documentation Structure
- Route-level documentation in route files
- Schema definitions in `/docs/swagger.js`
- Authentication examples
- Error response formats

## 🔄 Development Workflow

### Adding New Features
1. **Model**: Create/update database schema
2. **Service**: Implement business logic
3. **Controller**: Add request handlers
4. **Routes**: Define endpoints with documentation
5. **Middleware**: Add validation/authentication
6. **Testing**: Test with Postman/curl

### Code Organization Principles
- **Single Responsibility**: Each file has one clear purpose
- **DRY (Don't Repeat Yourself)**: Reusable services and utilities
- **Separation of Concerns**: Clear boundaries between layers
- **Error Handling**: Consistent error responses
- **Documentation**: All endpoints documented

## 🚀 Deployment Structure

### Environment Configurations
- **Development**: Local MongoDB, console logging
- **Production**: Cloud database, file logging, optimizations

### Scalability Considerations
- Service layer allows horizontal scaling
- Database indexing for search performance
- Cloudinary CDN for file delivery
- Rate limiting for API protection

## 📋 Best Practices Implemented

### Code Quality
- ✅ Consistent naming conventions
- ✅ JSDoc comments for functions
- ✅ Error handling in all layers
- ✅ Input validation and sanitization
- ✅ Modular, reusable code

### Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Input validation
- ✅ File type restrictions
- ✅ CORS configuration
- ✅ Helmet security headers

### Performance
- ✅ Database indexing
- ✅ Pagination for large datasets
- ✅ Efficient search algorithms
- ✅ Cloud file storage (CDN)
- ✅ Compressed responses

This modular architecture ensures the codebase is:
- **Maintainable**: Easy to update and extend
- **Testable**: Clear separation allows unit testing
- **Scalable**: Can handle increased load
- **Secure**: Multiple layers of protection
- **Documented**: Clear understanding for developers
