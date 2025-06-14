import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // This path is now correct
import { ThemeProvider } from './components/ThemeSwitcher'; // This path is now correct
import './index.css'; // This path is now correct

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider> {/* <-- WRAPPER START */}
        <App />
      </ThemeProvider> {/* <-- WRAPPER END */}
    </React.StrictMode>
  );
}