import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA support
// Using new URL(..., import.meta.url) allows Parcel to detect and bundle the sw.js file correctly
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let swUrl = './sw.js';

    try {
      // Fix: Use try-catch to handle environments where import.meta.url might be invalid or undefined
      // and ensure we pass the .href string to the register function.
      swUrl = new URL('./sw.js', import.meta.url || window.location.href).href;
    } catch (e) {
      console.warn('Service Worker URL construction failed, using fallback path.');
    }

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}