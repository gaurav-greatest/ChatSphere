import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store.js';
import App from './App.js';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'oklch(0.23 0.02 260)',
              color: 'oklch(0.90 0.01 260)',
              border: '1px solid oklch(0.30 0.02 260)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: 'oklch(0.65 0.19 160)',
                secondary: 'oklch(0.23 0.02 260)',
              },
            },
            error: {
              iconTheme: {
                primary: 'oklch(0.60 0.21 25)',
                secondary: 'oklch(0.23 0.02 260)',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
