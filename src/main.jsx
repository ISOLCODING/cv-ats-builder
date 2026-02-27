// src/main.jsx
// Entry point React 18 — mount App ke #root

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Polyfill Buffer for browser environment (needed by some PDF libraries)
import { Buffer } from 'buffer/';
window.Buffer = Buffer;
window.global = window;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
