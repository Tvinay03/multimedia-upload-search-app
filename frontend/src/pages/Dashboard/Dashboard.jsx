import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserFiles, incrementViewCount, deleteFile } from '../../store/fileSlice';
import { Link } from 'react-router-dom';
import FilePreview from '../../components/FilePreview/FilePreview';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { files, loading } = useSelector((state) => state.files);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserFiles());
  }, [dispatch]);

  const handleViewCountIncrement = async (fileId) => {
    try {
      await dispatch(incrementViewCount(fileId)).unwrap();
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await dispatch(deleteFile(fileId)).unwrap();
      // Refresh the files list after deletion
      dispatch(getUserFiles());
    } catch (error) {
      alert('Failed to delete file: ' + error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Manage your multimedia files</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/upload" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '2rem', 
          borderRadius: '10px', 
          textDecoration: 'none',
          textAlign: 'center'
        }}>
          <h3>📤 Upload Files</h3>
          <p>Add new multimedia files</p>
        </Link>
        
        <Link to="/search" style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          color: 'white', 
          padding: '2rem', 
          borderRadius: '10px', 
          textDecoration: 'none',
          textAlign: 'center'
        }}>
          <h3>🔍 Search Files</h3>
          <p>Find your files quickly</p>
        </Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Recent Files</h2>
        {loading ? (
          <p>Loading files...</p>
        ) : files.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '5rem',
            padding: '1rem 0'
          }}>
            {files.slice(0, 8).map((file) => (
              <FilePreview 
                key={file._id} 
                file={file} 
                onViewCountIncrement={handleViewCountIncrement}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>No files uploaded yet</p>
            <Link to="/upload" style={{
              background: '#667eea',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Upload Your First File
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
