import { createSlice } from '@reduxjs/toolkit';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'dark' | 'light';
}

const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getSavedTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('chatsphere-theme') as ThemeMode) || 'dark';
};

const resolveTheme = (mode: ThemeMode): 'dark' | 'light' => {
  return mode === 'system' ? getSystemTheme() : mode;
};

const savedMode = getSavedTheme();

const initialState: ThemeState = {
  mode: savedMode,
  resolved: resolveTheme(savedMode),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      state.resolved = resolveTheme(action.payload);
      localStorage.setItem('chatsphere-theme', action.payload);
    },
    toggleTheme: (state) => {
      const next = state.resolved === 'dark' ? 'light' : 'dark';
      state.mode = next;
      state.resolved = next;
      localStorage.setItem('chatsphere-theme', next);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
