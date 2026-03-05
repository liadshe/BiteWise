import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './components/homePage';
import Sidebar from './components/SideBar';
import PostPage from './components/PostPage'; 
import Login from './components/login';
import CreateRecipePage from './components/CreateRecipePage';
import EditPostPage from './components/EditPostPage';
import Register from './components/Register';
import ProfilePage from './components/ProfilePage';
import './App.css';


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
                  {/* When at /home/create, show CreateRecipePage */}
                  <Route path="/create" element={<CreateRecipePage />} />
                  {/* When at /home/edit/:id, show EditPostPage */}
                  <Route path="/edit/:id" element={<EditPostPage />} />
                  {/* When at /home/profile/:id, show ProfilePage (to be implemented) */}
                  <Route path="/profile" element={<ProfilePage />} />
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