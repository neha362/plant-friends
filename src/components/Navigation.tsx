import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Button } from 'semantic-ui-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import "../styles.css";

function Navigation() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Menu  className="navbar">
      <Menu.Item className="menu-header" as={Link} to="/shelf" header>
        🌱 Plant Friends
      </Menu.Item>

      <Menu.Item className="menu-item" as={Link} to="/shelf">
        My Shelf
      </Menu.Item>
      <Menu.Item className="menu-item" as={Link} to="/workstation">
        Study Timer
      </Menu.Item>
      <Menu.Item className="menu-item" as={Link} to="/tasklist">
        Tasks
      </Menu.Item>

      <Menu.Menu position="right">
        <Menu.Item>
          <span style={{ marginRight: '1rem' }}>
            {currentUser?.email}
          </span>
          <Button className="button" onClick={handleLogout} size="small">
            Logout
          </Button>
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
}

export default Navigation;
