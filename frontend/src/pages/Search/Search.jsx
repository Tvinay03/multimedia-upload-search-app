import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchFiles, incrementViewCount, deleteFile, clearSearchResults } from '../../store/fileSlice';
import FilePreview from '../../components/FilePreview/FilePreview';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    fileType: '',
    category: '',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const dispatch = useDispatch();
  const { searchResults, loading } = useSelector((state) => state.files);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear search results immediately when input becomes empty
    if (!value.trim()) {
      dispatch(clearSearchResults());
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchFiles({ 
        q: searchQuery,
        ...filters 
      }));
    } else {
      // Clear search results when query is empty
      dispatch(clearSearchResults());
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

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
      // Re-run the search to refresh results
      if (searchQuery.trim()) {
        dispatch(searchFiles({ 
          q: searchQuery,
          ...filters 
        }));
      }
    } catch (error) {
      alert('Failed to delete file: ' + error);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#000000',
        zIndex: 100,
        borderBottom: '1px solid #e1e5e9',
        padding: '1rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>🔍 Search Files</h1>
          <p style={{ margin: '0', color: '#666' }}>Find your uploaded files quickly</p>
        </div>
      </div>

      {/* Sticky Search Form */}
      <div style={{
        position: 'sticky',
        top: '80px',
        backgroundColor: 'white',
        zIndex: 99,
        borderBottom: '1px solid #e1e5e9',
        padding: '1rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search files by name, description, or tags..."
            style={{
              padding: '0.75rem',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              File Type
            </label>
            <select
              name="fileType"
              value={filters.fileType}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e1e5e9',
                borderRadius: '8px'
              }}
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e1e5e9',
                borderRadius: '8px'
              }}
            >
              <option value="">All Categories</option>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="education">Education</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e1e5e9',
                borderRadius: '8px'
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="date">Upload Date</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
              <option value="views">View Count</option>
            </select>
          </div>
        </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '400px' }}>
        {searchResults.length > 0 && (
          <h2 style={{ marginBottom: '2rem', marginTop: '1rem' }}>Search Results ({searchResults.length})</h2>
        )}
        
        {searchResults.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '2rem',
            padding: '1rem 0'
          }}>
            {searchResults.map((file) => (
              <FilePreview 
                key={file._id} 
                file={file} 
                onViewCountIncrement={handleViewCountIncrement}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : searchQuery && !loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>No files found for "{searchQuery}"</p>
            <p style={{ color: '#888' }}>Try different keywords or adjust your filters</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
