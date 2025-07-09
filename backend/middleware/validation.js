const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  validateRequest
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validateRequest
];

// File upload validation
const validateFileUpload = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  body('category')
    .optional()
    .isIn(['personal', 'work', 'education', 'entertainment', 'other'])
    .withMessage('Category must be one of: personal, work, education, entertainment, other'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  validateRequest
];

// Search validation
const validateSearch = [
  body('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  body('fileType')
    .optional()
    .isIn(['image', 'video', 'audio', 'document'])
    .withMessage('File type must be one of: image, video, audio, document'),
  
  body('category')
    .optional()
    .isIn(['personal', 'work', 'education', 'entertainment', 'other'])
    .withMessage('Category must be one of: personal, work, education, entertainment, other'),
  
  body('sortBy')
    .optional()
    .isIn(['relevance', 'date', 'views', 'size', 'name'])
    .withMessage('Sort by must be one of: relevance, date, views, size, name'),
  
  body('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  validateRequest
];

// File type validation middleware
const validateFileType = (req, res, next) => {
  // Check for multer file format (req.file) first, then fallback to express-fileupload format (req.files.file)
  const file = req.file || (req.files && req.files.file);
  
  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'audio/mp3',
    'audio/wav',
    'application/pdf'
  ];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Allowed types: ' + allowedTypes.join(', ')
    });
  }
  
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`
    });
  }
  
  next();
};

module.exports = {
  validateRequest,
  validateRegistration,
  validateLogin,
  validateFileUpload,
  validateSearch,
  validateFileType
};
