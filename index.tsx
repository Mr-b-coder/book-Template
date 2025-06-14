
import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import App from './App.tsx'; // Explicitly add .tsx extension

// Diagnostic log
if (typeof App === 'undefined') {
  console.error("Critical Error: App component failed to load. Check App.tsx and its imports for errors.");
} else {
  console.log("App component loaded successfully.");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement); 
// Render the app
root.render(
  <React.StrictMode>
    {typeof App !== 'undefined' ? <App /> : <div>App failed to load. Check console.</div>}
  </React.StrictMode>
);