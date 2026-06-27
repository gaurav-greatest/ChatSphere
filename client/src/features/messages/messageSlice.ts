import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import type { IMessagePopulated } from '@chatsphere/shared';

interface MessageState {
  messagesByChat: Record<string, IMessagePopulated[]>;
  isLoading: boolean;
  error: string | null;
  hasMoreByChat: Record<string, boolean>;
  pagesByChat: Record<string, number>;
}

const initialState: MessageState = {
  messagesByChat: {},
  isLoading: false,
  error: null,
  hasMoreByChat: {},
  pagesByChat: {},
};

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ chatId, page = 1, limit = 50 }: { chatId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/messages/chats/${chatId}/messages`, {
        params: { page, limit },
      });
      return { chatId, messages: data.data, hasMore: data.meta?.hasMore || false, page };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
  },
);

export const sendNewMessage = createAsyncThunk(
  'messages/sendMessage',
  async (
    { chatId, content, type = 'text', attachments, replyTo }: { chatId: string; content: string; type?: string; attachments?: any[]; replyTo?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post(`/messages/chats/${chatId}/messages`, {
        content,
        type,
        attachments,
        replyTo,
      });
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  },
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addIncomingMessage: (state, action: PayloadAction<IMessagePopulated>) => {
      const { chatId } = action.payload;
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      // Avoid duplicate inserts
      const exists = state.messagesByChat[chatId].some((m) => m._id === action.payload._id);
      if (!exists) {
        state.messagesByChat[chatId].push(action.payload);
      }
    },
    updateEditedMessage: (state, action: PayloadAction<IMessagePopulated>) => {
      const { chatId, _id } = action.payload;
      const list = state.messagesByChat[chatId];
      if (list) {
        const index = list.findIndex((m) => m._id === _id);
        if (index !== -1) {
          list[index] = action.payload;
        }
      }
    },
    updateDeletedMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      const list = state.messagesByChat[chatId];
      if (list) {
        const msg = list.find((m) => m._id === messageId);
        if (msg) {
          msg.content = 'This message was deleted';
          msg.isDeleted = true;
          msg.attachments = [];
        }
      }
    },
    updateReactions: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string; reactions: any[] }>,
    ) => {
      const { chatId, messageId, reactions } = action.payload;
      const list = state.messagesByChat[chatId];
      if (list) {
        const msg = list.find((m) => m._id === messageId);
        if (msg) {
          msg.reactions = reactions;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages, hasMore, page } = action.payload;
        state.isLoading = false;
        
        // Reverse array because DB returns newest first for page skip offset calculation,
        // but we render oldest first in chat window scroll streams.
        const reversed = [...messages].reverse();

        if (page === 1) {
          state.messagesByChat[chatId] = reversed;
        } else {
          state.messagesByChat[chatId] = [...reversed, ...(state.messagesByChat[chatId] || [])];
        }

        state.hasMoreByChat[chatId] = hasMore;
        state.pagesByChat[chatId] = page;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendNewMessage.fulfilled, (state, action) => {
        const { chatId } = action.payload;
        if (!state.messagesByChat[chatId]) {
          state.messagesByChat[chatId] = [];
        }
        const exists = state.messagesByChat[chatId].some((m) => m._id === action.payload._id);
        if (!exists) {
          state.messagesByChat[chatId].push(action.payload);
        }
      });
  },
});

export const {
  addIncomingMessage,
  updateEditedMessage,
  updateDeletedMessage,
  updateReactions,
} = messageSlice.actions;

export default messageSlice.reducer;
