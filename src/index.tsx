import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ThemeProvider from './components/ThemeSwitcher';
import './index.css'; // This is the most critical line for styling
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