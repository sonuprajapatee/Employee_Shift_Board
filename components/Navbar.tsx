import React from 'react';
import { getCurrentUser, logout } from '../services/authService';
import Button from './Button';

const Navbar: React.FC = () => {
  const user = getCurrentUser();

  if (!user) {
    return null; // Don't show navbar if not logged in
  }

  return (
    <nav className="bg-blue-700 p-4 shadow-md sticky top-0 z-10 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          Employee Shift Board
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white text-sm md:text-base">
            Logged in as: <span className="font-semibold">{user.email}</span> ({user.role})
          </span>
          <Button onClick={logout} variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;