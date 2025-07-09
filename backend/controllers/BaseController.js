const { createSuccessResponse, createErrorResponse } = require('../utils/helpers');

/**
 * Base controller class with common functionality
 */
class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {any} data - Response data
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json(
      createSuccessResponse(message, data, statusCode)
    );
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {array} errors - Array of validation errors
   */
  sendError(res, message, statusCode = 500, errors = null) {
    return res.status(statusCode).json(
      createErrorResponse(message, statusCode, errors)
    );
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {array} errors - Array of validation errors
   */
  sendValidationError(res, errors) {
    return res.status(400).json(
      createErrorResponse('Validation failed', 400, errors)
    );
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} resource - Resource name
   */
  sendNotFound(res, resource = 'Resource') {
    return res.status(404).json(
      createErrorResponse(`${resource} not found`, 404)
    );
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Custom message
   */
  sendUnauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json(
      createErrorResponse(message, 401)
    );
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Custom message
   */
  sendForbidden(res, message = 'Access forbidden') {
    return res.status(403).json(
      createErrorResponse(message, 403)
    );
  }

  /**
   * Handle async errors
   * @param {Function} fn - Async function
   * @returns {Function} Express middleware
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Extract pagination parameters
   * @param {Object} query - Request query object
   * @returns {Object} Pagination parameters
   */
  extractPaginationParams(query) {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 50); // Max 50 items per page
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
  }

  /**
   * Build pagination response
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} totalItems - Total number of items
   * @returns {Object} Pagination metadata
   */
  buildPaginationResponse(page, limit, totalItems) {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }
}

module.exports = BaseController;
