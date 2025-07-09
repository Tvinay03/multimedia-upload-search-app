const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * AuthService - Handles all authentication-related operations
 * This service provides methods for user registration, login, token management, and user operations
 */
class AuthService {
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  static async registerUser(userData) {
    try {
      const { name, email, password } = userData;
      console.log('Registering user:', { name, email });
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }
      
      // Create new user
      const user = new User({
        name,
        email,
        password // Will be hashed by User model pre-save hook
      });
      
      await user.save();
      
      // Generate token
      const token = this.generateToken(user._id);
      
      // Update last login
      await user.updateLastLogin();
      
      return {
        success: true,
        user: this.formatUserResponse(user),
        token,
        message: 'User registered successfully'
      };
      
    } catch (error) {
      console.error('Register user service error:', error);
      throw {
        success: false,
        message: error.message || 'Registration failed',
        error: error.message
      };
    }
  }

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login result
   */
  static async loginUser(credentials) {
    try {
      const { email, password } = credentials;
      
      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support');
      }
      
      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Generate token
      const token = this.generateToken(user._id);
      
      // Update last login
      await user.updateLastLogin();
      
      return {
        success: true,
        user: this.formatUserResponse(user),
        token,
        message: 'Login successful'
      };
      
    } catch (error) {
      console.error('Login user service error:', error);
      throw {
        success: false,
        message: error.message || 'Login failed',
        error: error.message
      };
    }
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        user: this.formatUserResponse(user)
      };
      
    } catch (error) {
      console.error('Get user profile service error:', error);
      throw {
        success: false,
        message: error.message || 'Failed to get user profile',
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update allowed fields
      const allowedUpdates = ['name', 'avatar'];
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          user[field] = updates[field];
        }
      });
      
      await user.save();
      
      return {
        success: true,
        user: this.formatUserResponse(user),
        message: 'Profile updated successfully'
      };
      
    } catch (error) {
      console.error('Update user profile service error:', error);
      throw {
        success: false,
        message: error.message || 'Failed to update profile',
        error: error.message
      };
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} Change password result
   */
  static async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;
      
      // Find user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      user.password = newPassword; // Will be hashed by pre-save hook
      await user.save();
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
      
    } catch (error) {
      console.error('Change password service error:', error);
      throw {
        success: false,
        message: error.message || 'Failed to change password',
        error: error.message
      };
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Token verification result
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      return {
        success: true,
        user: this.formatUserResponse(user),
        userId: user._id
      };
      
    } catch (error) {
      console.error('Verify token service error:', error);
      throw {
        success: false,
        message: error.message || 'Token verification failed',
        error: error.message
      };
    }
  }

  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  static generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  /**
   * Refresh JWT token
   * @param {string} userId - User ID
   * @returns {Promise<Object>} New token
   */
  static async refreshToken(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      const token = this.generateToken(user._id);
      
      return {
        success: true,
        token,
        user: this.formatUserResponse(user),
        message: 'Token refreshed successfully'
      };
      
    } catch (error) {
      console.error('Refresh token service error:', error);
      throw {
        success: false,
        message: error.message || 'Token refresh failed',
        error: error.message
      };
    }
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deactivation result
   */
  static async deactivateAccount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      user.isActive = false;
      await user.save();
      
      return {
        success: true,
        message: 'Account deactivated successfully'
      };
      
    } catch (error) {
      console.error('Deactivate account service error:', error);
      throw {
        success: false,
        message: error.message || 'Failed to deactivate account',
        error: error.message
      };
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  static async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const stats = {
        totalFiles: user.totalFiles,
        storageUsed: user.storageUsed,
        storageUsedFormatted: this.formatBytes(user.storageUsed),
        memberSince: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive
      };
      
      return {
        success: true,
        stats
      };
      
    } catch (error) {
      console.error('Get user stats service error:', error);
      throw {
        success: false,
        message: error.message || 'Failed to get user statistics',
        error: error.message
      };
    }
  }

  /**
   * Format user response (remove sensitive data)
   * @param {Object} user - User object
   * @returns {Object} Formatted user data
   */
  static formatUserResponse(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      totalFiles: user.totalFiles,
      storageUsed: user.storageUsed,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Bytes
   * @returns {string} Formatted string
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = AuthService;
