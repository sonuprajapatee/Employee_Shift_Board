import React, { useState } from 'react';
import { AuthResponse, APIError } from '../types';
import { login } from '../services/authService';
import InputField from './InputField';
import Button from './Button';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../constants';

interface LoginFormProps {
  onLoginSuccess: (authResponse: AuthResponse) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>(DEMO_ADMIN_EMAIL); // Pre-fill with admin credentials
  const [password, setPassword] = useState<string>(DEMO_ADMIN_PASSWORD); // Pre-fill with admin credentials
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await login(email, password);

    setIsLoading(false);
    if ('user' in response) {
      onLoginSuccess(response);
    } else {
      setError((response as APIError).message || 'An unknown error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <InputField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <InputField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />
      <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
        Login
      </Button>
      <p className="text-center text-sm text-gray-500 mt-4">
        Demo Credentials: <br/>
        Admin: {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD} <br/>
        User: user@example.com / password123
      </p>
    </form>
  );
};

export default LoginForm;