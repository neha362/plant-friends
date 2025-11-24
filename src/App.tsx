import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/login';
import ShelfPage from './pages/shelf';
import ShopPage from './pages/shop';
import WorkstationPage from './pages/workstation';
import TaskPage from './pages/tasklist';
import Navigation from './components/Navigation';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      {currentUser && <Navigation />}
      
      <Routes>
        <Route 
          path="/" 
          element={currentUser ? <Navigate to="/shelf" /> : <Navigate to="/login" />} 
        />
        
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/shelf"
          element={
            <ProtectedRoute>
              <ShelfPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <ShopPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/workstation"
          element={
            <ProtectedRoute>
              <WorkstationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasklist"
          element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;