const FileService = require('../services/FileService');
const BaseController = require('./BaseController');

/**
 * FileController - Handles file-related endpoints
 * Uses FileService for business logic and Cloudinary integration
 */
class FileController extends BaseController {
  
  /**
   * Upload a file to Cloudinary and store metadata in MongoDB
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          timestamp: new Date().toISOString()
        });
      }

      const fileData = {
        file: req.file,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        category: req.body.category,
        isPublic: req.body.isPublic
      };

      const result = await FileService.uploadFile(fileData, req.user.id);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          file: result.file
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Upload file error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'File upload failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user's files with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserFiles(req, res) {
    try {
      const result = await FileService.getUserFiles(req.user.id, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Files retrieved successfully',
        data: {
          files: result.files,
          pagination: result.pagination
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Get user files error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get files',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get file by ID with preview URL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getFileById(req, res) {
    try {
      const result = await FileService.getFileById(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'File retrieved successfully',
        data: {
          file: result.file
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Get file by ID error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get file',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update file metadata
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateFile(req, res) {
    try {
      const result = await FileService.updateFile(req.params.id, req.body, req.user.id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          file: result.file
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Update file error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                         error.message.includes('permission') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update file',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete file from Cloudinary and MongoDB
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteFile(req, res) {
    try {
      const result = await FileService.deleteFile(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Delete file error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                         error.message.includes('permission') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete file',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update file view count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateViewCount(req, res) {
    try {
      const result = await FileService.incrementViewCount(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'View count updated successfully',
        data: {
          viewCount: result.viewCount
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Update view count error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update view count',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get file statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getFileStats(req, res) {
    try {
      const result = await FileService.getFileStats(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'File statistics retrieved successfully',
        data: {
          stats: result.stats
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Get file stats error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get file statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Search files by query
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async searchFiles(req, res) {
    try {
      const result = await FileService.searchFiles(req.user.id, req.query);
      
      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: {
          files: result.files,
          pagination: result.pagination,
          query: req.query.q || ''
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Search files error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Search failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}
module.exports = FileController;
