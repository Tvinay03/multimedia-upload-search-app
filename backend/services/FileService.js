const File = require('../models/File');
const User = require('../models/User');
const CloudinaryService = require('./CloudinaryService');
const { formatBytes } = require('../utils/helpers');

/**
 * FileService - Handles all file-related operations
 * This service provides methods for file management, statistics, and business logic
 */
class FileService {
  
  /**
   * Upload a file with metadata
   * @param {Object} fileData - File data and metadata
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  static async uploadFile(fileData, userId) {
    try {
      const { file, title, description, tags, category, isPublic } = fileData;
      
      // Upload to Cloudinary
      const cloudinaryResult = await CloudinaryService.uploadFile(file, {
        folder: 'multimedia-app',
        resource_type: 'auto'
      });
      
      if (!cloudinaryResult.success) {
        throw new Error(cloudinaryResult.message);
      }
      
      // Determine file type
      const fileType = this.determineFileType(file.mimetype);
      
      // Create file record
      const originalName = file.originalname || file.name || 'unnamed';
      const fileRecord = new File({
        title: title || originalName,
        description,
        originalName: originalName,
        fileName: cloudinaryResult.fileName,
        cloudinaryId: cloudinaryResult.cloudinaryId,
        url: cloudinaryResult.url,
        secureUrl: cloudinaryResult.secureUrl,
        fileType,
        mimeType: file.mimetype,
        size: file.size,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
        category: category || 'other',
        isPublic: isPublic === 'true' || isPublic === true,
        uploadedBy: userId,
        metadata: {
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          resourceType: cloudinaryResult.resourceType
        }
      });
      
      // Generate search keywords
      fileRecord.searchKeywords = this.generateSearchKeywords(fileRecord);
      
      await fileRecord.save();
      
      // Update user statistics
      await this.updateUserStats(userId, file.size);
      
      return {
        success: true,
        file: fileRecord,
        message: 'File uploaded successfully'
      };
      
    } catch (error) {
      console.error('File upload service error:', error);
      throw {
        success: false,
        message: 'File upload failed',
        error: error.message
      };
    }
  }

  /**
   * Get user's files with pagination and filtering
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Files list
   */
  static async getUserFiles(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        fileType,
        category,
        sortBy = 'date',
        sortOrder = 'desc'
      } = filters;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Build query
      const query = { uploadedBy: userId };
      if (fileType) query.fileType = fileType;
      if (category) query.category = category;
      
      // Build sort
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      let sortOptions = {};
      
      switch (sortBy) {
        case 'date':
          sortOptions = { createdAt: sortDirection };
          break;
        case 'name':
          sortOptions = { title: sortDirection };
          break;
        case 'size':
          sortOptions = { size: sortDirection };
          break;
        case 'views':
          sortOptions = { viewCount: sortDirection };
          break;
        default:
          sortOptions = { createdAt: sortDirection };
      }
      
      // Get files
      const files = await File.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      // Get total count
      const totalFiles = await File.countDocuments(query);
      
      return {
        success: true,
        files,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalFiles / parseInt(limit)),
          totalFiles,
          hasNext: skip + parseInt(limit) < totalFiles,
          hasPrev: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      };
      
    } catch (error) {
      console.error('Get user files service error:', error);
      throw {
        success: false,
        message: 'Failed to get user files',
        error: error.message
      };
    }
  }

  /**
   * Get file by ID with permission check
   * @param {string} fileId - File ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} File details
   */
  static async getFileById(fileId, userId) {
    try {
      const file = await File.findOne({
        _id: fileId,
        $or: [
          { uploadedBy: userId },
          { isPublic: true }
        ]
      }).populate('uploadedBy', 'name email');
      
      if (!file) {
        throw new Error('File not found or access denied');
      }
      
      return {
        success: true,
        file
      };
      
    } catch (error) {
      console.error('Get file by ID service error:', error);
      throw {
        success: false,
        message: 'Failed to get file details',
        error: error.message
      };
    }
  }

  /**
   * Update file metadata
   * @param {string} fileId - File ID
   * @param {string} userId - User ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated file
   */
  static async updateFile(fileId, userId, updates) {
    try {
      const file = await File.findOne({
        _id: fileId,
        uploadedBy: userId
      });
      
      if (!file) {
        throw new Error('File not found or access denied');
      }
      
      // Update allowed fields
      const allowedUpdates = ['title', 'description', 'tags', 'category', 'isPublic'];
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'tags' && typeof updates[field] === 'string') {
            file[field] = updates[field].split(',').map(tag => tag.trim());
          } else if (field === 'isPublic') {
            file[field] = updates[field] === 'true' || updates[field] === true;
          } else {
            file[field] = updates[field];
          }
        }
      });
      
      // Regenerate search keywords
      file.searchKeywords = this.generateSearchKeywords(file);
      
      await file.save();
      
      return {
        success: true,
        file,
        message: 'File updated successfully'
      };
      
    } catch (error) {
      console.error('Update file service error:', error);
      throw {
        success: false,
        message: 'Failed to update file',
        error: error.message
      };
    }
  }

  /**
   * Delete file with cleanup
   * @param {string} fileId - File ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteFile(fileId, userId) {
    try {
      const file = await File.findOne({
        _id: fileId,
        uploadedBy: userId
      });
      
      if (!file) {
        throw new Error('File not found or access denied');
      }
      
      // Delete from Cloudinary
      await CloudinaryService.deleteFile(file.cloudinaryId, file.metadata.resourceType);
      
      // Delete from database
      await File.findByIdAndDelete(fileId);
      
      // Update user statistics
      await this.updateUserStats(userId, -file.size);
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
      
    } catch (error) {
      console.error('Delete file service error:', error);
      throw {
        success: false,
        message: 'Failed to delete file',
        error: error.message
      };
    }
  }

  /**
   * Increment view count
   * @param {string} fileId - File ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated view count
   */
  static async incrementViewCount(fileId, userId) {
    try {
      const file = await File.findOneAndUpdate(
        {
          _id: fileId,
          $or: [
            { uploadedBy: userId },
            { isPublic: true }
          ]
        },
        { $inc: { viewCount: 1 } },
        { new: true }
      );
      
      if (!file) {
        throw new Error('File not found or access denied');
      }
      
      return {
        success: true,
        viewCount: file.viewCount,
        message: 'View count updated'
      };
      
    } catch (error) {
      console.error('Increment view count service error:', error);
      throw {
        success: false,
        message: 'Failed to update view count',
        error: error.message
      };
    }
  }

  /**
   * Get file statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Statistics
   */
  static async getFileStats(userId) {
    try {
      // Get file type statistics
      const fileTypeStats = await File.aggregate([
        { $match: { uploadedBy: userId } },
        {
          $group: {
            _id: '$fileType',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
            totalViews: { $sum: '$viewCount' }
          }
        }
      ]);
      
      // Get total statistics
      const totalStats = await File.aggregate([
        { $match: { uploadedBy: userId } },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' },
            totalViews: { $sum: '$viewCount' }
          }
        }
      ]);
      
      const stats = {
        totalFiles: totalStats[0]?.totalFiles || 0,
        totalSize: totalStats[0]?.totalSize || 0,
        totalSizeFormatted: formatBytes(totalStats[0]?.totalSize || 0),
        totalViews: totalStats[0]?.totalViews || 0,
        fileTypes: fileTypeStats.map(stat => ({
          type: stat._id,
          count: stat.count,
          totalSize: stat.totalSize,
          totalSizeFormatted: formatBytes(stat.totalSize),
          totalViews: stat.totalViews
        }))
      };
      
      return {
        success: true,
        stats
      };
      
    } catch (error) {
      console.error('Get file stats service error:', error);
      throw {
        success: false,
        message: 'Failed to get file statistics',
        error: error.message
      };
    }
  }

  /**
   * Search files by query with relevance ranking
   * @param {string} userId - User ID
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Search results
   */
  static async searchFiles(userId, filters = {}) {
    try {
      const {
        q: searchQuery = '',
        page = 1,
        limit = 10,
        fileType,
        category,
        sortBy = 'relevance',
        sortOrder = 'desc'
      } = filters;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Build base query
      const query = { uploadedBy: userId };
      
      // Add filters
      if (fileType) query.fileType = fileType;
      if (category) query.category = category;
      
      let files;
      let totalFiles;
      
      if (searchQuery.trim()) {
        // Search with relevance scoring
        const searchRegex = new RegExp(searchQuery.trim(), 'i');
        
        // Use regular find with manual scoring
        const searchFilter = {
          ...query,
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { originalName: searchRegex },
            { tags: searchRegex },
            { searchKeywords: searchRegex }
          ]
        };
        
        const searchResults = await File.find(searchFilter).lean();
        
        // Calculate relevance scores manually
        const scoredResults = searchResults.map(file => {
          let score = 0;
          const queryLower = searchQuery.toLowerCase();
          const titleLower = (file.title || '').toLowerCase();
          
          // Title exact match bonus
          if (titleLower === queryLower) score += 20;
          // Title contains match
          else if (titleLower.includes(queryLower)) score += 10;
          
          // Description contains match
          if ((file.description || '').toLowerCase().includes(queryLower)) score += 5;
          
          // Tags exact match
          if (file.tags && file.tags.some(tag => tag.toLowerCase() === queryLower)) score += 15;
          // Tags partial match
          else if (file.tags && file.tags.some(tag => tag.toLowerCase().includes(queryLower))) score += 7;
          
          // SearchKeywords match
          if (file.searchKeywords && file.searchKeywords.some(keyword => keyword.toLowerCase().includes(queryLower))) score += 3;
          
          // View count bonus
          score += Math.log(file.viewCount + 1) * 1;
          
          // Recency bonus (newer files get slight boost)
          const daysSinceUpload = (new Date() - new Date(file.createdAt)) / (1000 * 60 * 60 * 24);
          if (daysSinceUpload < 30) score += (30 - daysSinceUpload) * 0.1;
          
          return { ...file, relevanceScore: score };
        });
        
        // Sort by relevance score
        scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Apply pagination
        files = scoredResults.slice(skip, skip + parseInt(limit));
        totalFiles = searchResults.length;
        
      } else {
        // Regular query without search term
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        let sortOptions = {};
        
        switch (sortBy) {
          case 'date':
            sortOptions = { createdAt: sortDirection };
            break;
          case 'name':
            sortOptions = { title: sortDirection };
            break;
          case 'size':
            sortOptions = { size: sortDirection };
            break;
          case 'views':
            sortOptions = { viewCount: sortDirection };
            break;
          default:
            sortOptions = { createdAt: sortDirection };
        }
        
        files = await File.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean();
        
        totalFiles = await File.countDocuments(query);
      }
      
      return {
        success: true,
        files,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalFiles / parseInt(limit)),
          totalFiles,
          hasNext: skip + parseInt(limit) < totalFiles,
          hasPrev: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      };
      
    } catch (error) {
      console.error('Search files error:', error);
      throw {
        success: false,
        message: 'Search failed',
        error: error.message
      };
    }
  }

  /**
   * Determine file type from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} File type
   */
  static determineFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  /**
   * Generate search keywords from file metadata
   * @param {Object} file - File object
   * @returns {Array} Search keywords
   */
  static generateSearchKeywords(file) {
    const keywords = [];
    
    // Add title words
    if (file.title) {
      keywords.push(...file.title.toLowerCase().split(/\s+/));
    }
    
    // Add description words
    if (file.description) {
      keywords.push(...file.description.toLowerCase().split(/\s+/));
    }
    
    // Add tags
    if (file.tags && Array.isArray(file.tags)) {
      keywords.push(...file.tags.map(tag => tag.toLowerCase()));
    }
    
    // Add filename words
    if (file.originalName) {
      keywords.push(...file.originalName.toLowerCase().split(/[.\s]+/));
    }
    
    // Add file type and category
    keywords.push(file.fileType, file.category);
    
    // Remove duplicates and empty strings
    return [...new Set(keywords.filter(keyword => keyword && keyword.length > 2))];
  }

  /**
   * Update user statistics
   * @param {string} userId - User ID
   * @param {number} sizeChange - Size change (positive for upload, negative for delete)
   */
  static async updateUserStats(userId, sizeChange) {
    try {
      const user = await User.findById(userId);
      if (user) {
        if (sizeChange > 0) {
          user.totalFiles += 1;
          user.storageUsed += sizeChange;
        } else {
          user.totalFiles = Math.max(0, user.totalFiles - 1);
          user.storageUsed = Math.max(0, user.storageUsed + sizeChange); // sizeChange is negative
        }
        await user.save();
      }
    } catch (error) {
      console.error('Update user stats error:', error);
      // Don't throw error for stats update failure
    }
  }
}

module.exports = FileService;
