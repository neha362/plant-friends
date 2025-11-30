import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';

function Navigation() {
  return (
    <div>
    <div className="navbar">
      <div className="navbar-logo">Plant Friends</div>
      <div className="navbar-links">
        <NavLink to="/shelf" className={({ isActive }) => isActive ? "active" : "inactive"}>
          Shelf
        </NavLink>
        <NavLink to="/shop" className={({ isActive }) => isActive ? "active" : "inactive"}>
          Shop
        </NavLink>
        <NavLink to="/workstation" className={({ isActive }) => isActive ? "active" : "inactive"}>
          Workstation
        </NavLink>
        <NavLink to="/tasklist" className={({ isActive }) => isActive ? "active" : "inactive"}>
          Tasks
        </NavLink>
      </div>
    </div>
    </div>
  );
}

export default Navigation;
