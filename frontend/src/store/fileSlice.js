import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const uploadFile = createAsyncThunk(
  'files/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const getUserFiles = createAsyncThunk(
  'files/getUserFiles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/files', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const searchFiles = createAsyncThunk(
  'files/search',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/files/search', { params: searchParams });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/delete',
  async (fileId, { rejectWithValue }) => {
    try {
      await api.delete(`/files/${fileId}`);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const incrementViewCount = createAsyncThunk(
  'files/incrementViewCount',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/files/${fileId}/view`);
      return { fileId, viewCount: response.data.data.viewCount };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  files: [],
  searchResults: [],
  uploadProgress: 0,
  loading: false,
  uploading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    hasMore: false,
  },
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload File
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.files.unshift(action.payload.file);
        state.uploadProgress = 0;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      // Get User Files
      .addCase(getUserFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload.files;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Files
      .addCase(searchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.files;
      })
      .addCase(searchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete File
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(file => file._id !== action.payload);
        state.searchResults = state.searchResults.filter(file => file._id !== action.payload);
      })
      // Increment View Count
      .addCase(incrementViewCount.fulfilled, (state, action) => {
        const { fileId, viewCount } = action.payload;
        
        // Update in files array
        const fileIndex = state.files.findIndex(file => file._id === fileId);
        if (fileIndex !== -1) {
          state.files[fileIndex].viewCount = viewCount;
        }
        
        // Update in search results array
        const searchIndex = state.searchResults.findIndex(file => file._id === fileId);
        if (searchIndex !== -1) {
          state.searchResults[searchIndex].viewCount = viewCount;
        }
      })
      .addCase(incrementViewCount.rejected, (state, action) => {
        console.error('View count increment failed:', action.payload);
      });
  },
});

export const { clearError, clearSearchResults, updateUploadProgress } = fileSlice.actions;
export default fileSlice.reducer;
