# Multimedia File Upload & Search API

A comprehensive Node.js backend API for uploading, managing, and searching multimedia files (images, videos, audio, documents) with JWT authentication, Cloudinary integration, and advanced search capabilities.

## 🚀 Features

- **User Authentication**: JWT-based registration and login system
- **File Upload**: Support for multiple file types (images, videos, audio, PDFs)
- **Cloud Storage**: Cloudinary integration for reliable file storage
- **Advanced Search**: Full-text search with relevance ranking
- **File Management**: CRUD operations for uploaded files
- **Security**: Rate limiting, input validation, and secure file handling
- **API Documentation**: Comprehensive Swagger documentation
- **Error Handling**: Graceful error responses and logging

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cloud Storage**: Cloudinary
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
backend/
├── 📁 config/              # Configuration management
│   ├── app.js              # Application settings
│   ├── cloudinary.js       # Cloudinary configuration
│   └── database.js         # Database connection
│
├── 📁 controllers/         # Request handlers (MVC Controllers)
│   ├── AuthController.js   # Authentication endpoints
│   ├── FileController.js   # File management endpoints
│   └── SearchController.js # Search endpoints
│
├── 📁 docs/               # Documentation
│   ├── swagger.js         # API documentation setup
│   └── PROJECT_STRUCTURE.md # Architecture documentation
│
├── 📁 middleware/         # Express middleware
│   ├── auth.js            # JWT authentication
│   └── validation.js      # Input validation
│
├── 📁 models/             # Database models (Mongoose)
│   ├── User.js            # User schema
│   └── File.js            # File schema
│
├── 📁 routes/             # API route definitions
│   ├── auth.js            # Authentication routes
│   ├── files.js           # File management routes
│   └── search.js          # Search routes
│
├── 📁 services/           # Business logic layer
│   ├── AuthService.js     # Authentication logic
│   ├── CloudinaryService.js # Cloud storage operations
│   ├── FileService.js     # File management logic
│   └── SearchService.js   # Search operations
│
├── 📁 utils/              # Utility functions
│   └── helpers.js         # Helper functions
│
├── app.js                 # Express app setup
├── server.js              # Server startup
└── package.json           # Dependencies
```

## 🏗️ Modular Architecture

This backend follows a **clean, modular MVC + Services pattern**:

### **🎮 Controllers** (`/controllers/`)
- Handle HTTP requests and responses
- Validate input and format output  
- Call appropriate service methods
- Keep business logic minimal

### **🛠️ Services** (`/services/`)
- Contain all business logic
- Handle data processing and external API calls
- Reusable across multiple controllers
- Clear separation of concerns

### **📊 Models** (`/models/`)
- Define database schemas
- Handle data validation
- Contain model-specific methods

### **🛣️ Routes** (`/routes/`)
- Define API endpoints
- Apply middleware (auth, validation)
- Map routes to controller methods
- Include Swagger documentation

### **⚙️ Configuration** (`/config/`)
- Centralized application settings
- Environment-based configurations
- Database and external service setup

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://chinnuvinay663:WL9UK2pKQMrC3rXy@mvp-cluster.gubfphm.mongodb.net/multimedia-app

# JWT
JWT_SECRET=your_super_secret_jwt_key_multimedia_app_2025
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=dwykuxqcn
CLOUDINARY_API_KEY=964322631617663
CLOUDINARY_API_SECRET=SuiDxaphYLn8P4rJ8TwKg1f0CJk
CLOUDINARY_URL=cloudinary://964322631617663:SuiDxaphYLn8P4rJ8TwKg1f0CJk@dwykuxqcn

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/avi,audio/mp3,audio/wav,application/pdf
```

### 4. Start the server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

Access the interactive Swagger documentation at: `http://localhost:5000/api-docs`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

### File Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload a file |
| GET | `/api/files` | Get user's files |
| GET | `/api/files/:id` | Get file by ID |
| PUT | `/api/files/:id/view` | Increment view count |
| DELETE | `/api/files/:id` | Delete a file |
| GET | `/api/files/stats` | Get file statistics |

### Search Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Search files with ranking |
| GET | `/api/search/suggestions` | Get search suggestions |
| GET | `/api/search/popular` | Get popular search terms |

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📤 File Upload

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, AVI, MOV, WMV
- **Audio**: MP3, WAV, FLAC, AAC
- **Documents**: PDF, DOC, DOCX, TXT

### Upload Request Example
```bash
curl -X POST \
  http://localhost:5000/api/files/upload \
  -H 'Authorization: Bearer <your-jwt-token>' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/file.jpg' \
  -F 'title=My Image' \
  -F 'description=A beautiful landscape photo' \
  -F 'tags=["nature", "landscape", "photography"]' \
  -F 'category=personal' \
  -F 'isPublic=true'
```

## 🔍 Search Features

### Basic Search
```
GET /api/search?q=nature&fileType=image&sortBy=relevance
```

### Advanced Search Parameters
- `q`: Search query (searches title, description, tags, filename)
- `fileType`: Filter by file type (image, video, audio, document)
- `category`: Filter by category (personal, work, education, entertainment, other)
- `sortBy`: Sort results (relevance, date, views, size, name)
- `sortOrder`: Sort order (asc, desc)
- `page`: Page number for pagination
- `limit`: Items per page (max 50)
- `myFiles`: Search only user's files (boolean)

### Ranking System
Search results are ranked based on:
- **Text Match Score** (40%): How well the query matches file metadata
- **View Count** (30%): Popular files rank higher
- **Recency** (20%): Newer files get priority
- **File Size** (10%): Larger files may rank higher

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation for all inputs
- **File Type Validation**: Only allowed file types can be uploaded
- **File Size Limits**: Maximum 10MB per file
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers for Express
- **Password Hashing**: bcrypt for secure password storage

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  avatar: String,
  totalFiles: Number,
  storageUsed: Number,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### File Model
```javascript
{
  title: String,
  description: String,
  originalName: String,
  fileName: String,
  cloudinaryId: String,
  url: String,
  secureUrl: String,
  fileType: String,
  mimeType: String,
  size: Number,
  tags: [String],
  category: String,
  isPublic: Boolean,
  viewCount: Number,
  downloadCount: Number,
  uploadedBy: ObjectId,
  metadata: Object,
  searchKeywords: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<your-production-jwt-secret>
# ... other production configs
```

### Deployment Platforms
- **Railway**: Easy deployment with automatic builds
- **Heroku**: Classic platform with good MongoDB support
- **DigitalOcean**: App Platform for scalable deployments
- **AWS**: EC2 or Elastic Beanstalk for full control

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "timestamp": "2025-01-07T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if any */ ],
  "timestamp": "2025-01-07T10:30:00Z"
}
```

## 🧪 Testing

### Manual Testing with Postman
1. Import the API collection from `/api-docs.json`
2. Set environment variables for base URL and auth token
3. Test each endpoint with various scenarios

### Test User Registration
```bash
curl -X POST \
  http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## 🔧 Development

### Adding New Features
1. Create models in `/models`
2. Add routes in `/routes`
3. Implement middleware in `/middleware`
4. Add utilities in `/utils`
5. Update Swagger documentation

### Code Style
- Use ES6+ features
- Follow async/await pattern
- Add proper error handling
- Include JSDoc comments
- Validate all inputs

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email support@multimediaapp.com or create an issue in the repository.

---

**Happy Coding! 🎉**
