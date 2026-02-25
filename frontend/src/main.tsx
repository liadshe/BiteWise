import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App' 

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}