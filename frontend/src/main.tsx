import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App' 
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId="556059274312-4ntjvlaf90pq0fiipig7gf3m31ker5jc.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}