export enum Role {
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
}

export interface User {
  id: string;
  email: string;
  role: Role;
  employeeId?: string; // Optional for admin, required for normal user
  token: string;
}

export interface Employee {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName?: string; // Populated on fetch, not directly stored
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface AuthResponse {
  user: User;
}

export interface APIError {
  message: string;
}

export interface ShiftFormValues {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
}