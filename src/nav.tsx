import React from 'react';
import { NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './styles.css';

function Navigation() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-logo">🌱 Plant Friends</div>
        
        <div className="navbar-center">
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

        <div className="navbar-right">
          {currentUser && (
            <span className="user-email">
              {currentUser.email}
            </span>
          )}
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navigation;