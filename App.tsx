import React, { useEffect, useState } from 'react';
import { AuthResponse, User } from './types';
import { getCurrentUser, isAuthenticated, logout } from './services/authService';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
// @fix: Import Button component.
import Button from './components/Button';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false); // To prevent flashing unauthenticated content

  useEffect(() => {
    const user = getCurrentUser();
    if (isAuthenticated() && user) {
      setCurrentUser(user);
    }
    setIsReady(true);
  }, []);

  const handleLoginSuccess = (authResponse: AuthResponse) => {
    setCurrentUser(authResponse.user);
    window.location.hash = '/dashboard';
  };

  // Simple hash-based routing
  const getRouteComponent = () => {
    const hash = window.location.hash.slice(1); // Remove leading '#'

    if (!isReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-600">Loading application...</p>
        </div>
      );
    }

    if (!currentUser) {
      // If no user, always show login page, regardless of hash
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    switch (hash) {
      case '/dashboard':
        return (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        );
      case '/login':
      case '': // Default route
        return (
          // If already logged in and trying to go to login, redirect to dashboard
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        );
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
              <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
              <Button onClick={() => window.location.hash = '/dashboard'}>Go to Dashboard</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {currentUser && <Navbar />}
      <main className="flex-grow">
        {getRouteComponent()}
      </main>
    </div>
  );
};

export default App;