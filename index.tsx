import React from 'react';
import ReactDOM from 'react-dom/client';

// We will add your App component back later.
// For now, let's just make sure the basics work.

// Import the CSS file. It's in the same folder now.
import './index.css'; 

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">
        It works! Your React & Tailwind app is running.
      </h1>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}