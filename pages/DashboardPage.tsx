import React, { useState, useEffect, useCallback } from 'react';
import { Employee, Shift, User, Role, APIError } from '../types';
import { getCurrentUser, isAdmin } from '../services/authService';
import { getEmployees, getShifts } from '../services/apiService';
import ShiftTable from '../components/ShiftTable';
import ShiftForm from '../components/ShiftForm';
import SelectField from '../components/SelectField';
import InputField from '../components/InputField';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';

const DashboardPage: React.FC = () => {
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState<boolean>(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(false);
  const [shiftError, setShiftError] = useState<string>('');
  const [employeeError, setEmployeeError] = useState<string>('');

  const fetchShifts = useCallback(async () => {
    if (!currentUser) return;

    setIsLoadingShifts(true);
    setShiftError('');

    let employeeIdFilter: string | undefined = undefined;
    if (userIsAdmin) {
      employeeIdFilter = selectedEmployeeId || undefined; // Admin can filter by selected employee or view all
    } else {
      employeeIdFilter = currentUser.employeeId; // Normal user only sees their own
    }

    const response = await getShifts(employeeIdFilter, selectedDate || undefined);

    if (response.data) {
      setShifts(response.data);
    } else {
      setShiftError((response.error as APIError).message || 'Failed to fetch shifts.');
    }
    setIsLoadingShifts(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userIsAdmin, selectedEmployeeId, selectedDate]);


  const fetchEmployees = useCallback(async () => {
    if (!userIsAdmin) return; // Only admins need the employee list for filters/form

    setIsLoadingEmployees(true);
    setEmployeeError('');
    const response = await getEmployees();
    if (response.data) {
      setEmployees(response.data);
      // Automatically select the first employee if none is selected
      if (response.data.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(response.data[0].id);
      }
    } else {
      setEmployeeError((response.error as APIError).message || 'Failed to fetch employees.');
    }
    setIsLoadingEmployees(false);
  }, [userIsAdmin, selectedEmployeeId]);


  useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchShifts]); // Depend on fetchShifts which is useCallback

  useEffect(() => {
    if (userIsAdmin) {
      fetchEmployees();
    }
  }, [fetchEmployees, userIsAdmin]); // Depend on fetchEmployees

  if (!currentUser) {
    // Should be caught by ProtectedRoute, but good for type safety
    window.location.hash = '/login';
    return null;
  }

  const handleRefreshShifts = () => {
    fetchShifts();
  };

  const handleApplyFilters = () => {
    fetchShifts();
  };

  const handleClearFilters = () => {
    setSelectedEmployeeId('');
    setSelectedDate('');
    // Trigger a refetch with cleared filters
    // This will cause `fetchShifts` to run again due to `selectedEmployeeId` and `selectedDate` changing
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Welcome to your Dashboard, {currentUser.email.split('@')[0]}!
      </h1>

      {/* Admin specific content: Shift Assignment Form */}
      {userIsAdmin && (
        <ShiftForm currentUser={currentUser} onShiftCreated={handleRefreshShifts} />
      )}

      {/* Shift Filters (Admin and Normal user view their own, but admin can filter other employees) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">View Shifts</h3>
        {userIsAdmin && isLoadingEmployees && <LoadingSpinner />}
        {userIsAdmin && employeeError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{employeeError}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {userIsAdmin && (
            <SelectField
              id="employeeFilter"
              label="Filter by Employee"
              options={[
                { value: '', label: 'All Employees' },
                ...employees.map((emp) => ({ value: emp.id, label: `${emp.name} (${emp.employeeCode})` })),
              ]}
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              placeholder="Select an employee"
              className="md:col-span-1"
            />
          )}
          <InputField
            id="dateFilter"
            label="Filter by Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="md:col-span-1"
          />
          <div className="md:col-span-1 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2 mt-auto">
            <Button onClick={handleApplyFilters} variant="primary" className="w-full md:w-auto">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="secondary" className="w-full md:w-auto">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Shift Table */}
      <ShiftTable
        shifts={shifts}
        currentUser={currentUser}
        onShiftDeleted={handleRefreshShifts}
        isLoading={isLoadingShifts}
        error={shiftError}
      />
    </div>
  );
};

export default DashboardPage;