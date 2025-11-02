import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📦</span>
          QR Inventory
        </Link>
        <ul className="navbar-menu">
          <li className={isActive('/') ? 'active' : ''}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className={isActive('/inventory') ? 'active' : ''}>
            <Link to="/inventory">Inventory</Link>
          </li>
          <li className={isActive('/scanner') ? 'active' : ''}>
            <Link to="/scanner">Scanner</Link>
          </li>
          <li className={isActive('/reports') ? 'active' : ''}>
            <Link to="/reports">Reports</Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;