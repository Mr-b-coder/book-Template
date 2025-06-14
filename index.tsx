import React from 'react';
import ReactDOM from 'react-dom/client';

// Import your real application component from the new file
import App from './App.tsx'; 

// Import the CSS file
import './index.css'; 

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}