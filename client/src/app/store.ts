import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import themeReducer from '../features/theme/themeSlice.js';
import chatReducer from '../features/chat/chatSlice.js';
import messageReducer from '../features/messages/messageSlice.js';
import userReducer from '../features/users/userSlice.js';
import notificationReducer from '../features/notifications/notificationSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    chat: chatReducer,
    messages: messageReducer,
    users: userReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Socket instances and Date objects are non-serializable
        ignoredActions: ['auth/setUser'],
        ignoredPaths: ['socket'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
