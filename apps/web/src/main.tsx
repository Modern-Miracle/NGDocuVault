import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/providers/AuthProvider';
import { initializeStore } from './lib/store/initialize-store';
import './index.css';

/**
 * Application Entry Point *
 * This file bootstraps the React application with all necessary providers
 * and configuration. It sets up the root rendering context for the entire
 * Docu Vault application.
 *
 * Setup includes:
 * - React Strict Mode for development warnings
 * - Browser Router for client-side routing
 * - Authentication Provider for user state management
 * - Store initialization for persisted state
 *
 * The application is rendered into the root DOM element and wrapped with
 * all necessary context providers to ensure proper functionality across
 * all components..
 */

// Initialize the auth store before rendering the app
// This ensures the persisted state is loaded from cookies before any components mount
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
