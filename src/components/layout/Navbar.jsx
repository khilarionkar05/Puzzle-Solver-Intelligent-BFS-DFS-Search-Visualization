import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          <span>🧩</span>
          <span>PUZZLE SOLVER</span>
          <span className="brand-badge">DAA</span>
        </Link>
        
        <nav>
          <ul className="nav-links">
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={({ isActive }) => (isActive ? 'active' : '')}
                end
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/puzzle" 
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Puzzle
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/how-it-works" 
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                How It Works
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
