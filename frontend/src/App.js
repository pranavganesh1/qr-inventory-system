import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Scanner from './pages/Scanner';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import Reports from './pages/Reports';
import Login from './pages/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem('token')
  );

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/inventory" 
            element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/scanner" 
            element={isAuthenticated ? <Scanner /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/add-item" 
            element={isAuthenticated ? <AddItem /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/item/:id" 
            element={isAuthenticated ? <ItemDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/reports" 
            element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;