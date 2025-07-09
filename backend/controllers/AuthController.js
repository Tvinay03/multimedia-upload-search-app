const AuthService = require('../services/AuthService');
const BaseController = require('./BaseController');

/**
 * AuthController - Handles authentication endpoints
 * Uses AuthService for business logic
 */
class AuthController extends BaseController {
  
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      console.log('Registering user:', req.body);
      const result = await AuthService.registerUser(req.body);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token: result.token
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      const statusCode = error.message.includes('already exists') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Registration failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      const result = await AuthService.loginUser(req.body);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token: result.token
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Login error:', error);
      const statusCode = error.message.includes('Invalid') ? 401 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Login failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProfile(req, res) {
    try {
      const result = await AuthService.getUserProfile(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: result.user
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Get profile error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateProfile(req, res) {
    try {
      const result = await AuthService.updateUserProfile(req.user.id, req.body);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Update profile error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async changePassword(req, res) {
    try {
      const result = await AuthService.changePassword(req.user.id, req.body);
      
      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Change password error:', error);
      const statusCode = error.message.includes('incorrect') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to change password',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Refresh JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async refreshToken(req, res) {
    try {
      const result = await AuthService.refreshToken(req.user.id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          token: result.token,
          user: result.user
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Refresh token error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to refresh token',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserStats(req, res) {
    try {
      const result = await AuthService.getUserStats(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: {
          stats: result.stats
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Get user stats error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user statistics',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = AuthController;
