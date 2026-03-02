import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './components/HomePage';
import Sidebar from './components/SideBar';
import PostPage from './components/PostPage'; 
import Login from './components/Login';
import CreateRecipePage from './components/CreateRecipePage';
import './App.css';
import Register from './components/Register';

function App() {
  return (
    <BrowserRouter>
    <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/home/*" 
          element={
            <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
              <Sidebar />
              <div className="flex-grow-1 overflow-auto" style={{ height: '100vh' }}>
                <Routes>
                  {/* When at /home, show HomePage */}
                  <Route path="/" element={<HomePage />} />
                  {/* When at /home/post/:id, show PostPage */}
                  <Route path="/post/:id" element={<PostPage />} />
                </Routes>
              </div>
            </div>
          } 
        />

        {/* 4. Redirect any unknown routes to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;