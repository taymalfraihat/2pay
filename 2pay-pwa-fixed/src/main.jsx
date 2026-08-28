import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './2Pay.jsx';
import './pwa.js';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
