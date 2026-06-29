import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import type { IChatPopulated } from '@chatsphere/shared';

interface ChatState {
  chats: IChatPopulated[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/chats');
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch chats');
  }
});

export const createDirectChat = createAsyncThunk(
  'chat/createDirectChat',
  async (recipientId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/chats', { recipientId });
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create chat');
    }
  },
);

export const createGroupChat = createAsyncThunk(
  'chat/createGroupChat',
  async (
    payload: { groupName: string; members: string[]; groupDescription?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post('/chats/groups', payload);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create group');
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
    updateChatLastMessage: (state, action: PayloadAction<{ chatId: string; message: any }>) => {
      const chat = state.chats.find((c) => c._id === action.payload.chatId);
      if (chat) {
        chat.lastMessage = action.payload.message;
        chat.updatedAt = new Date();
        // Move chat to top of list
        state.chats = [chat, ...state.chats.filter((c) => c._id !== chat._id)];
      }
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c._id === action.payload);
      if (chat && chat._id !== state.activeChatId) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }
    },
    clearUnreadCount: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c._id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },
    updateChatMuteState: (state, action: PayloadAction<{ chatId: string; isMuted: boolean }>) => {
      const chat = state.chats.find((c) => c._id === action.payload.chatId);
      if (chat) {
        chat.isMuted = action.payload.isMuted;
      }
    },
    updateChatArchiveState: (state, action: PayloadAction<{ chatId: string; isArchived: boolean }>) => {
      const chat = state.chats.find((c) => c._id === action.payload.chatId);
      if (chat) {
        chat.isArchived = action.payload.isArchived;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chats
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Direct Chat
      .addCase(createDirectChat.fulfilled, (state, action) => {
        const exists = state.chats.some((c) => c._id === action.payload._id);
        if (!exists) {
          state.chats.unshift(action.payload);
        }
        state.activeChatId = action.payload._id;
      })
      // Create Group Chat
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.activeChatId = action.payload._id;
      });
  },
});

export const {
  setActiveChatId,
  updateChatLastMessage,
  incrementUnreadCount,
  clearUnreadCount,
  updateChatMuteState,
  updateChatArchiveState,
} = chatSlice.actions;

export default chatSlice.reducer;
