import React from 'react';
import LoginForm from '../components/LoginForm';
import { AuthResponse } from '../types';

interface LoginPageProps {
  onLoginSuccess: (authResponse: AuthResponse) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <LoginForm onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

export default LoginPage;