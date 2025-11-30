import React from 'react';
import { NavLink } from 'react-router-dom';
import './nav.css';

function Navigation() {
  return (
    <div className="navbar">
      <div className="navbar-logo">🌱 Plant Friends</div>
      <div className="navbar-links">
        <NavLink to="/shelf" className={({ isActive }) => isActive ? "active" : ""}>
          Shelf
        </NavLink>
        <NavLink to="/shop" className={({ isActive }) => isActive ? "active" : ""}>
          Shop
        </NavLink>
        <NavLink to="/workstation" className={({ isActive }) => isActive ? "active" : ""}>
          Workstation
        </NavLink>
        <NavLink to="/tasklist" className={({ isActive }) => isActive ? "active" : ""}>
          Tasks
        </NavLink>
      </div>
    </div>
  );
}

export default Navigation;
