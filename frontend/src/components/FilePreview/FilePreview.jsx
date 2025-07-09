import React, { useState } from 'react';
import './FilePreview.css';

const FilePreview = ({ file, onViewCountIncrement, onDelete }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = async () => {
    setIsPreviewOpen(true);
    // Increment view count when preview is opened
    if (onViewCountIncrement) {
      try {
        await onViewCountIncrement(file._id);
      } catch (error) {
        console.error('Failed to increment view count:', error);
      }
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${file.title}"? This action cannot be undone.`)) {
      if (onDelete) {
        onDelete(file._id);
      }
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  const renderPreviewContent = () => {
    if (!file.url) return null;

    switch (file.fileType) {
      case 'image':
        return (
          <img 
            src={file.secureUrl || file.url} 
            alt={file.title}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh', 
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        );
      case 'video':
        return (
          <video 
            controls 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh',
              borderRadius: '8px'
            }}
          >
            <source src={file.secureUrl || file.url} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
            <h3>{file.title}</h3>
            <audio 
              controls 
              style={{ 
                width: '100%',
                marginTop: '1rem'
              }}
            >
              <source src={file.secureUrl || file.url} type={file.mimeType} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case 'document':
        return (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
            <h3>{file.title}</h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              {file.mimeType} • {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
            <a 
              href={file.secureUrl || file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                background: '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Open Document
            </a>
          </div>
        );
      default:
        return (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
            <h3>{file.title}</h3>
            <p style={{ color: '#666' }}>File preview not available</p>
          </div>
        );
    }
  };

  return (
    <>
      {/* File Card */}
      <div className="file-card">
        <div className="file-icon">
          {getFileIcon(file.fileType)}
        </div>
        <div className="file-info">
          <h4 className="file-title">{file.title}</h4>
          <p className="file-meta">
            {file.fileType} • {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
          {file.description && (
            <p className="file-description">{file.description}</p>
          )}
          {file.tags && file.tags.length > 0 && (
            <div className="file-tags">
              {file.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
              {file.tags.length > 3 && (
                <span className="tag-more">+{file.tags.length - 3} more</span>
              )}
            </div>
          )}
          <div className="file-stats">
            <span className="stat">
              👁️ {file.viewCount || 0} views
            </span>
            <span className="stat">
              📅 {new Date(file.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="file-actions">
          <button 
            onClick={handlePreview}
            className="btn btn-primary"
          >
            Preview
          </button>
          {file.url && (
            <a 
              href={file.secureUrl || file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Open
            </a>
          )}
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
            title="Delete file"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="preview-modal" onClick={handleClosePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>{file.title}</h3>
              <button 
                onClick={handleClosePreview}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="preview-body">
              {renderPreviewContent()}
            </div>
            <div className="preview-footer">
              <div className="file-details">
                <p><strong>Type:</strong> {file.fileType}</p>
                <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(1)} MB</p>
                <p><strong>Uploaded:</strong> {new Date(file.createdAt).toLocaleString()}</p>
                {file.category && <p><strong>Category:</strong> {file.category}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreview;
