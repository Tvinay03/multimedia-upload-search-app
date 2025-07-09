const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a file title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  secureUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['image', 'video', 'audio', 'document']
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['personal', 'work', 'education', 'entertainment', 'other'],
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    bitrate: Number,
    format: String
  },
  searchKeywords: [{
    type: String,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
fileSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  originalName: 'text',
  searchKeywords: 'text'
});

fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ fileType: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ viewCount: -1 });

// Pre-save middleware to generate search keywords
fileSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description') || this.isModified('tags')) {
    const keywords = [];
    
    // Add title words
    if (this.title) {
      keywords.push(...this.title.toLowerCase().split(/\s+/));
    }
    
    // Add description words
    if (this.description) {
      keywords.push(...this.description.toLowerCase().split(/\s+/));
    }
    
    // Add tags
    if (this.tags && this.tags.length > 0) {
      keywords.push(...this.tags);
    }
    
    // Add original file name words
    if (this.originalName) {
      const nameWithoutExt = this.originalName.toLowerCase().replace(/\.[^/.]+$/, '');
      keywords.push(...nameWithoutExt.split(/[\s_-]+/));
    }
    
    // Remove duplicates and filter out empty strings
    this.searchKeywords = [...new Set(keywords)].filter(keyword => keyword.length > 0);
  }
  next();
});

// Method to increment view count
fileSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment download count
fileSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to get file statistics
fileSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { uploadedBy: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$fileType',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        totalViews: { $sum: '$viewCount' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('File', fileSchema);
