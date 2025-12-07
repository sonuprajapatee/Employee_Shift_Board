import { APIError, AuthResponse, Employee, Role, Shift, ShiftFormValues, User } from '../types';
import { SEEDED_USERS, SEEDED_EMPLOYEES } from '../constants';
import { calculateShiftDurationInHours, doShiftsOverlap } from '../utils/dateUtils';

// In-memory data store for the mock API
let _users: User[] = SEEDED_USERS.map(user => ({ ...user, token: `mock-token-${user.id}` }));
let _employees: Employee[] = [...SEEDED_EMPLOYEES];
let _shifts: Shift[] = [];
let nextShiftId = 1;

// Simulate network delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// @fix: Adjust `findUserByEmail` to return the seeded user object that contains the password.
// The `User` type does not contain `password`, it's used only for internal mock authentication.
const findUserByEmail = (email: string): typeof SEEDED_USERS[number] | undefined => {
  // Use SEEDED_USERS (which has password) to find user for auth
  return SEEDED_USERS.find(u => u.email === email);
};

const findEmployeeById = (id: string): Employee | undefined => {
  return _employees.find(e => e.id === id);
};

/**
 * Mock login API.
 */
export const mockLogin = async (email: string, password: string): Promise<AuthResponse | APIError> => {
  await simulateDelay();

  const user = findUserByEmail(email);

  // @fix: `user` now correctly has a `password` property from `SEEDED_USERS`.
  if (!user || user.password !== password) {
    return { message: 'Invalid credentials' };
  }

  // Generate a mock JWT for the user
  const token = `mock-jwt-for-${user.email}-${Date.now()}`;
  // @fix: Construct the `authenticatedUser` to match the `User` interface (no password, with token).
  const authenticatedUser: User = {
    id: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    token: token,
  };

  // Update token in our mock user store (if we were using a real DB)
  const userIndex = _users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    _users[userIndex] = authenticatedUser;
  }

  return { user: authenticatedUser };
};

/**
 * Mock GET /employees API.
 */
// @fix: Update return type to include APIError for consistency with error handling in apiService.ts
export const mockGetEmployees = async (): Promise<Employee[] | APIError> => {
  await simulateDelay();
  return _employees;
};

/**
 * Mock POST /shifts API.
 * @fix: Change `currentUser` to be the first argument for consistency.
 */
export const mockCreateShift = async (currentUser: User, newShift: ShiftFormValues): Promise<Shift | APIError> => {
  await simulateDelay();

  // Role-based access: Only admins can create shifts
  if (currentUser.role !== Role.ADMIN) {
    return { message: 'Unauthorized: Only admins can create shifts.' };
  }

  // 1. Shift Must Be Minimum 4 Hours
  const duration = calculateShiftDurationInHours(newShift.startTime, newShift.endTime);
  if (duration < 4) {
    return { message: 'Shift must be a minimum of 4 hours.' };
  }

  // 2. No Overlapping Shifts
  const employeeShiftsOnDate = _shifts.filter(
    s => s.employeeId === newShift.employeeId && s.date === newShift.date,
  );

  for (const existingShift of employeeShiftsOnDate) {
    if (doShiftsOverlap(newShift, existingShift)) {
      return { message: `Overlapping shift detected for ${newShift.employeeId} on ${newShift.date}.` };
    }
  }

  const employee = findEmployeeById(newShift.employeeId);
  if (!employee) {
    return { message: 'Employee not found.' };
  }

  const shiftToSave: Shift = {
    id: `shift-${nextShiftId++}`,
    employeeId: newShift.employeeId,
    date: newShift.date,
    startTime: newShift.startTime,
    endTime: newShift.endTime,
    employeeName: employee.name, // Add employee name for convenience
  };
  _shifts.push(shiftToSave);

  return shiftToSave;
};

/**
 * Mock GET /shifts API with filters.
 */
// @fix: Update return type to include APIError for consistency with error handling in apiService.ts
export const mockGetShifts = async (
  currentUser: User,
  employeeIdFilter?: string,
  dateFilter?: string,
): Promise<Shift[] | APIError> => {
  await simulateDelay();

  let filteredShifts = _shifts;

  // 3. Normal Users See Only Their Own Shifts
  if (currentUser.role === Role.NORMAL_USER) {
    if (!currentUser.employeeId) {
      return []; // Normal user must be linked to an employee
    }
    filteredShifts = filteredShifts.filter(s => s.employeeId === currentUser.employeeId);
  } else {
    // Admin can view all shifts, or filtered by employeeId
    if (employeeIdFilter) {
      filteredShifts = filteredShifts.filter(s => s.employeeId === employeeIdFilter);
    }
  }

  if (dateFilter) {
    filteredShifts = filteredShifts.filter(s => s.date === dateFilter);
  }

  // Populate employee names for display
  return filteredShifts.map(shift => {
    const employee = findEmployeeById(shift.employeeId);
    return { ...shift, employeeName: employee ? employee.name : 'Unknown Employee' };
  });
};

/**
 * Mock DELETE /shift/:id API.
 * @fix: Change `currentUser` to be the first argument for consistency.
 */
export const mockDeleteShift = async (currentUser: User, shiftId: string): Promise<{ success: boolean } | APIError> => {
  await simulateDelay();

  // Role-based access: Only admins can delete shifts
  if (currentUser.role !== Role.ADMIN) {
    return { message: 'Unauthorized: Only admins can delete shifts.' };
  }

  const initialLength = _shifts.length;
  _shifts = _shifts.filter(s => s.id !== shiftId);

  if (_shifts.length < initialLength) {
    return { success: true };
  } else {
    return { message: 'Shift not found.' };
  }
};

// Seed some initial shifts for testing (ensure no overlaps or violations)
(() => {
  const adminEmpId = SEEDED_USERS.find(u => u.role === Role.ADMIN)?.employeeId || 'emp-1';
  const normalEmpId = SEEDED_USERS.find(u => u.role === Role.NORMAL_USER)?.employeeId || 'emp-2';

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  _shifts.push({
    id: `shift-${nextShiftId++}`,
    employeeId: adminEmpId,
    date: '2023-10-26',
    startTime: '09:00',
    endTime: '17:00',
    employeeName: SEEDED_EMPLOYEES.find(e => e.id === adminEmpId)?.name,
  });
  _shifts.push({
    id: `shift-${nextShiftId++}`,
    employeeId: normalEmpId,
    date: '2023-10-27',
    startTime: '10:00',
    endTime: '18:00',
    employeeName: SEEDED_EMPLOYEES.find(e => e.id === normalEmpId)?.name,
  });
  _shifts.push({
    id: `shift-${nextShiftId++}`,
    employeeId: 'emp-3',
    date: '2023-10-28',
    startTime: '08:00',
    endTime: '16:00',
    employeeName: SEEDED_EMPLOYEES.find(e => e.id === 'emp-3')?.name,
  });
  _shifts.push({
    id: `shift-${nextShiftId++}`,
    employeeId: adminEmpId,
    date: '2023-10-28',
    startTime: '10:00',
    endTime: '19:00', // 9 hours
    employeeName: SEEDED_EMPLOYEES.find(e => e.id === adminEmpId)?.name,
  });
})();