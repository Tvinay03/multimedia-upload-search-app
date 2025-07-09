const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

/**
 * CloudinaryService - Handles all Cloudinary operations
 * This service provides methods for uploading, deleting, and managing files on Cloudinary
 */
class CloudinaryService {
  
  /**
   * Upload a file to Cloudinary
   * @param {Object} file - File object from multer or express-fileupload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadFile(file, options = {}) {
    try {
      const {
        folder = 'multimedia-app',
        resource_type = 'auto',
        quality = 'auto',
        fetch_format = 'auto'
      } = options;

      // Generate unique filename - handle both multer and express-fileupload formats
      const timestamp = Date.now();
      const originalName = file.originalname || file.name || 'unnamed';
      const uniqueFilename = `${timestamp}-${originalName}`;
      
      const uploadOptions = {
        folder: folder,
        resource_type: resource_type,
        public_id: uniqueFilename,
        quality: quality,
        fetch_format: fetch_format,
        use_filename: true,
        unique_filename: false
      };

      let result;
      
      // Handle multer file (buffer) vs express-fileupload file (tempFilePath)
      if (file.buffer) {
        // Multer format - upload from buffer
        result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(file.buffer);
        });
      } else if (file.tempFilePath) {
        // Express-fileupload format - upload from temp file path
        result = await cloudinary.uploader.upload(file.tempFilePath, uploadOptions);
        // Clean up temp file
        await this.cleanupTempFile(file.tempFilePath);
      } else {
        throw new Error('Invalid file format - missing buffer or tempFilePath');
      }
      
      return {
        success: true,
        cloudinaryId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        fileName: uniqueFilename,
        originalName: originalName,
        mimeType: file.mimetype
      };
      
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // Clean up temp file even on error (for express-fileupload)
      if (file.tempFilePath) {
        await this.cleanupTempFile(file.tempFilePath);
      }
      
      throw {
        success: false,
        message: 'Failed to upload file to cloud storage',
        error: error.message
      };
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param {string} cloudinaryId - Cloudinary public ID
   * @param {string} resourceType - Resource type (image, video, raw, etc.)
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteFile(cloudinaryId, resourceType = 'image') {
    try {
      // If resourceType is 'auto', try to determine the correct type
      // or default to common types in order of likelihood
      let actualResourceType = resourceType;
      
      if (resourceType === 'auto') {
        // Try image first (most common), then video, then raw
        const typesToTry = ['image', 'video', 'raw'];
        let deleteResult = null;
        
        for (const type of typesToTry) {
          try {
            deleteResult = await cloudinary.uploader.destroy(cloudinaryId, {
              resource_type: type
            });
            
            // If successful (result is 'ok' or 'not found'), break
            if (deleteResult.result === 'ok' || deleteResult.result === 'not found') {
              actualResourceType = type;
              break;
            }
          } catch (typeError) {
            // Continue trying other types
            console.log(`Failed to delete as ${type}, trying next type...`);
            continue;
          }
        }
        
        if (!deleteResult || (deleteResult.result !== 'ok' && deleteResult.result !== 'not found')) {
          throw new Error('Could not delete file with any resource type');
        }
        
        return {
          success: true,
          result: deleteResult.result,
          resourceType: actualResourceType,
          message: 'File deleted successfully from cloud storage'
        };
        
      } else {
        // Use the specified resource type
        const result = await cloudinary.uploader.destroy(cloudinaryId, {
          resource_type: resourceType
        });
        
        return {
          success: true,
          result: result.result,
          resourceType: resourceType,
          message: 'File deleted successfully from cloud storage'
        };
      }
      
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw {
        success: false,
        message: 'Failed to delete file from cloud storage',
        error: error.message
      };
    }
  }

  /**
   * Get file details from Cloudinary
   * @param {string} cloudinaryId - Cloudinary public ID
   * @returns {Promise<Object>} File details
   */
  static async getFileDetails(cloudinaryId) {
    try {
      const result = await cloudinary.api.resource(cloudinaryId);
      
      return {
        success: true,
        details: {
          public_id: result.public_id,
          format: result.format,
          resource_type: result.resource_type,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          url: result.url,
          secure_url: result.secure_url,
          created_at: result.created_at
        }
      };
      
    } catch (error) {
      console.error('Cloudinary get details error:', error);
      throw {
        success: false,
        message: 'Failed to get file details from cloud storage',
        error: error.message
      };
    }
  }

  /**
   * Generate transformation URL for images
   * @param {string} cloudinaryId - Cloudinary public ID
   * @param {Object} transformations - Transformation options
   * @returns {string} Transformed URL
   */
  static generateTransformationUrl(cloudinaryId, transformations = {}) {
    try {
      const {
        width,
        height,
        crop = 'fit',
        quality = 'auto',
        format = 'auto'
      } = transformations;

      const transformOptions = {
        width,
        height,
        crop,
        quality,
        format
      };

      return cloudinary.url(cloudinaryId, transformOptions);
      
    } catch (error) {
      console.error('Cloudinary transformation error:', error);
      return null;
    }
  }

  /**
   * Clean up temporary file
   * @param {string} tempFilePath - Path to temporary file
   */
  static async cleanupTempFile(tempFilePath) {
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (error) {
      console.error('Temp file cleanup error:', error);
      // Don't throw error for cleanup issues
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  static async getStorageStats() {
    try {
      const result = await cloudinary.api.usage();
      
      return {
        success: true,
        stats: {
          credits: result.credits,
          used_credits: result.used_credits,
          transformations: result.transformations,
          objects: result.objects,
          bandwidth: result.bandwidth,
          storage: result.storage,
          requests: result.requests,
          resources: result.resources,
          derived_resources: result.derived_resources
        }
      };
      
    } catch (error) {
      console.error('Cloudinary storage stats error:', error);
      throw {
        success: false,
        message: 'Failed to get storage statistics',
        error: error.message
      };
    }
  }
}

module.exports = CloudinaryService;
