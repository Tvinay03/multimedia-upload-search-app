const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary configuration and setup
 */
class CloudinaryConfig {
  
  /**
   * Initialize Cloudinary configuration
   */
  static configure() {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });
      
      console.log('✅ Cloudinary configured successfully');
      
      // Test configuration
      this.testConnection();
      
    } catch (error) {
      console.error('❌ Cloudinary configuration failed:', error);
      throw error;
    }
  }
  
  /**
   * Test Cloudinary connection
   */
  static async testConnection() {
    try {
      const result = await cloudinary.api.ping();
      if (result.status === 'ok') {
        console.log('✅ Cloudinary connection test passed');
      }
    } catch (error) {
      console.error('❌ Cloudinary connection test failed:', error);
    }
  }
  
  /**
   * Get Cloudinary configuration details
   * @returns {Object} Configuration status
   */
  static getConfigStatus() {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set',
      api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set',
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET)
    };
  }
  
  /**
   * Get supported file types configuration
   * @returns {Object} File types configuration
   */
  static getSupportedFileTypes() {
    return {
      images: {
        formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'],
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      videos: {
        formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
        mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska'],
        maxSize: 100 * 1024 * 1024 // 100MB
      },
      audios: {
        formats: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'wma'],
        mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/x-ms-wma'],
        maxSize: 50 * 1024 * 1024 // 50MB
      },
      documents: {
        formats: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
        mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'application/vnd.oasis.opendocument.text'],
        maxSize: 25 * 1024 * 1024 // 25MB
      }
    };
  }
  
  /**
   * Get upload presets configuration
   * @returns {Object} Upload presets
   */
  static getUploadPresets() {
    return {
      images: {
        folder: 'multimedia-app/images',
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      videos: {
        folder: 'multimedia-app/videos',
        transformation: [
          { width: 1280, height: 720, crop: 'limit' },
          { quality: 'auto' },
          { bit_rate: '1m' }
        ]
      },
      audios: {
        folder: 'multimedia-app/audios',
        transformation: [
          { audio_codec: 'mp3' },
          { bit_rate: '128k' }
        ]
      },
      documents: {
        folder: 'multimedia-app/documents',
        resource_type: 'raw'
      }
    };
  }
}

module.exports = CloudinaryConfig;
