import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

interface UserState {
  searchResults: any[];
  blockedUsers: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  searchResults: [],
  blockedUsers: [],
  isLoading: false,
  error: null,
};

export const searchProfiles = createAsyncThunk(
  'users/searchProfiles',
  async ({ query, page = 1, limit = 20 }: { query: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/search', { params: { q: query, page, limit } });
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Search failed');
    }
  },
);

export const blockUserProfile = createAsyncThunk(
  'users/blockUser',
  async (targetId: string, { rejectWithValue }) => {
    try {
      await api.post(`/users/block/${targetId}`);
      return targetId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to block user');
    }
  },
);

export const unblockUserProfile = createAsyncThunk(
  'users/unblockUser',
  async (targetId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/block/${targetId}`);
      return targetId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to unblock user');
    }
  },
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.isLoading = false;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(blockUserProfile.fulfilled, (state, action) => {
        state.blockedUsers.push(action.payload);
      })
      .addCase(unblockUserProfile.fulfilled, (state, action) => {
        state.blockedUsers = state.blockedUsers.filter((id) => id !== action.payload);
      });
  },
});

export const { clearSearchResults } = userSlice.actions;
export default userSlice.reducer;
