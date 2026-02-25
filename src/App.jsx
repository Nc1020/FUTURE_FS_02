import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
