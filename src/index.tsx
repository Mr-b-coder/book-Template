import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './components/ThemeSwitcher';

// --- V V V THIS IS THE LINE THAT FIXES EVERYTHING V V V ---
import './index.css';
// --- ^ ^ ^ THIS IS THE LINE THAT FIXES EVERYTHING ^ ^ ^ ---

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}