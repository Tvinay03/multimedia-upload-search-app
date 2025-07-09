// Utility functions for the application

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @returns {object} Pagination metadata
 */
const getPaginationMeta = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = parseInt(page);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
};

/**
 * Convert bytes to human readable format
 * @param {number} bytes - Bytes to convert
 * @param {number} decimals - Number of decimal places
 * @returns {string} Human readable size
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generate file slug from filename
 * @param {string} filename - Original filename
 * @returns {string} URL-friendly slug
 */
const generateSlug = (filename) => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extract file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if file is an image
 * @param {string} mimetype - File mimetype
 * @returns {boolean} True if image
 */
const isImage = (mimetype) => {
  return mimetype.startsWith('image/');
};

/**
 * Check if file is a video
 * @param {string} mimetype - File mimetype
 * @returns {boolean} True if video
 */
const isVideo = (mimetype) => {
  return mimetype.startsWith('video/');
};

/**
 * Check if file is audio
 * @param {string} mimetype - File mimetype
 * @returns {boolean} True if audio
 */
const isAudio = (mimetype) => {
  return mimetype.startsWith('audio/');
};

/**
 * Check if file is a document
 * @param {string} mimetype - File mimetype
 * @returns {boolean} True if document
 */
const isDocument = (mimetype) => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  return documentTypes.includes(mimetype);
};

/**
 * Calculate relevance score for search results
 * @param {object} file - File object
 * @param {string} searchQuery - Search query
 * @returns {number} Relevance score
 */
const calculateRelevanceScore = (file, searchQuery) => {
  let score = 0;
  const query = searchQuery.toLowerCase();
  
  // Title match (highest weight)
  if (file.title && file.title.toLowerCase().includes(query)) {
    score += 50;
  }
  
  // Description match
  if (file.description && file.description.toLowerCase().includes(query)) {
    score += 30;
  }
  
  // Tag match
  if (file.tags && file.tags.some(tag => tag.toLowerCase().includes(query))) {
    score += 25;
  }
  
  // Filename match
  if (file.originalName && file.originalName.toLowerCase().includes(query)) {
    score += 20;
  }
  
  // View count bonus
  score += Math.min(file.viewCount || 0, 10);
  
  // Recency bonus (newer files get higher score)
  const daysSinceUpload = (Date.now() - new Date(file.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpload < 7) {
    score += 15;
  } else if (daysSinceUpload < 30) {
    score += 10;
  } else if (daysSinceUpload < 90) {
    score += 5;
  }
  
  return score;
};

/**
 * Validate file type
 * @param {string} mimetype - File mimetype
 * @returns {boolean} True if valid file type
 */
const isValidFileType = (mimetype) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'audio/mp3',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  return allowedTypes.includes(mimetype);
};

/**
 * Generate thumbnail URL for different file types
 * @param {object} file - File object
 * @returns {string} Thumbnail URL
 */
const generateThumbnailUrl = (file) => {
  const baseUrl = file.secureUrl;
  
  if (isImage(file.mimeType)) {
    return baseUrl.replace('/upload/', '/upload/w_300,h_200,c_fill/');
  } else if (isVideo(file.mimeType)) {
    return baseUrl.replace('/upload/', '/upload/so_0,w_300,h_200,c_fill/') + '.jpg';
  } else if (file.mimeType === 'application/pdf') {
    return baseUrl.replace('/upload/', '/upload/pg_1,w_300,h_200,c_fill/') + '.jpg';
  }
  
  // Default thumbnail for other file types
  return '/default-thumbnail.png';
};

/**
 * Create error response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {array} errors - Array of validation errors
 * @returns {object} Error response object
 */
const createErrorResponse = (message, statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    statusCode,
    errors,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create success response object
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code
 * @returns {object} Success response object
 */
const createSuccessResponse = (message, data = null, statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  generateRandomString,
  formatDate,
  isValidEmail,
  sanitizeInput,
  getPaginationMeta,
  formatBytes,
  generateSlug,
  getFileExtension,
  isImage,
  isVideo,
  isAudio,
  isDocument,
  calculateRelevanceScore,
  isValidFileType,
  generateThumbnailUrl,
  createErrorResponse,
  createSuccessResponse
};
