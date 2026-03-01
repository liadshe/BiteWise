import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Sidebar from './components/SideBar';
import PostPage from './components/PostPage'; 
import CreateRecipePage from './components/CreateRecipePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Sidebar />
        <div className="flex-grow-1 overflow-auto" style={{ height: '100vh' }}>
          <Routes>
            {/* navigate to home page */}
            <Route path="/" element={<HomePage />} />
            {/* navigate to post page with dynamic id */}
            <Route path="/post/:id" element={<PostPage />} />
            {/* navigate to create recipe page */}
            <Route path="/create" element={<CreateRecipePage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;