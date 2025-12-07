import { APIError, Employee, Shift, ShiftFormValues, User } from '../types';
import { mockGetEmployees, mockCreateShift, mockGetShifts, mockDeleteShift } from './mockApi'; // Using mock API
import { getToken, getCurrentUser } from './authService'; // @fix: Import getCurrentUser

// This service would normally interact with a real backend API.
// For this assignment, we're using mockApi to simulate the backend.

interface ApiResponse<T> {
  data?: T;
  error?: APIError;
}

/**
 * Generic function to make authenticated API requests.
 * In a real app, this would handle actual `fetch` calls.
 * Here, it acts as a wrapper for our mock functions.
 */
// @fix: Removed the generic `callApi` function due to type safety issues with inconsistent mock API signatures.
// Instead, each API call is handled directly.

export const getEmployees = async (): Promise<ApiResponse<Employee[]>> => {
  // @fix: No current user or token needed for mockGetEmployees
  const response = await mockGetEmployees();
  if ('message' in response) {
    return { error: response };
  }
  return { data: response };
};

export const createShift = async (newShift: ShiftFormValues): Promise<ApiResponse<Shift>> => {
  const token = getToken();
  const currentUser = getCurrentUser(); // @fix: Use getCurrentUser from authService
  if (!token || !currentUser) { // @fix: Check for both token and currentUser
    return { error: { message: 'Authentication required.' } };
  }
  const response = await mockCreateShift(currentUser, newShift);
  if ('message' in response) {
    return { error: response };
  }
  return { data: response };
};

export const getShifts = async (employeeId?: string, date?: string): Promise<ApiResponse<Shift[]>> => {
  const token = getToken();
  const currentUser = getCurrentUser(); // @fix: Use getCurrentUser from authService
  if (!token || !currentUser) { // @fix: Check for both token and currentUser
    return { error: { message: 'Authentication required.' } };
  }
  const response = await mockGetShifts(currentUser, employeeId, date);
  if ('message' in response) {
    return { error: response };
  }
  return { data: response };
};

export const deleteShift = async (shiftId: string): Promise<ApiResponse<{ success: boolean }>> => {
  const token = getToken();
  const currentUser = getCurrentUser(); // @fix: Use getCurrentUser from authService
  if (!token || !currentUser) { // @fix: Check for both token and currentUser
    return { error: { message: 'Authentication required.' } };
  }
  const response = await mockDeleteShift(currentUser, shiftId);
  if ('message' in response) {
    return { error: response };
  }
  return { data: response };
};