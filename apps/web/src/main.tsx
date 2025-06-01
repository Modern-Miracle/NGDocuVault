import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/providers/AuthProvider';
import { initializeStore } from './lib/store/initialize-store';
import './index.css';

// Initialize the auth store before rendering the app
// This ensures the persisted state is loaded from cookies
initializeStore();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
