// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext.tsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // --- REMOVED <React.StrictMode> from around this block ---
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider>
        <SocketProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <App />
        </SocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);