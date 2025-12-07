import { Role } from './types';

export const API_BASE_URL = 'http://localhost:3000/api'; // Placeholder, actual API will be mocked

export const DEMO_ADMIN_EMAIL = 'hire-me@anshumat.org';
export const DEMO_ADMIN_PASSWORD = 'HireMe@2025!';

// Mock data for seeded users (as per requirements)
export const SEEDED_USERS = [
  {
    id: 'user-admin-1',
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    role: Role.ADMIN,
    employeeId: 'emp-1', // Link admin to an employee for demonstration
  },
  {
    id: 'user-normal-1',
    email: 'user@example.com',
    password: 'password123',
    role: Role.NORMAL_USER,
    employeeId: 'emp-2',
  },
];

export const SEEDED_EMPLOYEES = [
  { id: 'emp-1', name: 'Admin User', employeeCode: 'ADM001', department: 'Management' },
  { id: 'emp-2', name: 'Normal User', employeeCode: 'USR001', department: 'Sales' },
  { id: 'emp-3', name: 'John Doe', employeeCode: 'JHD001', department: 'Marketing' },
  { id: 'emp-4', name: 'Jane Smith', employeeCode: 'JAS001', department: 'Operations' },
];