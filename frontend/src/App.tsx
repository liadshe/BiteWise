import HomePage from './components/homePage';
import Sidebar from './components/sideBar';

function App() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div className="flex-grow-1">
        <HomePage />
      </div>
    </div>
  );
}

export default App;