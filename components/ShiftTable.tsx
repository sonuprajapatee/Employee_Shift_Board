import React from 'react';
import { Shift, Role, User, APIError } from '../types';
import Button from './Button';
import { deleteShift, getShifts } from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';

interface ShiftTableProps {
  shifts: Shift[];
  currentUser: User;
  onShiftDeleted: () => void; // Callback to refresh shifts after deletion
  isLoading?: boolean;
  error?: string;
}

const ShiftTable: React.FC<ShiftTableProps> = ({ shifts, currentUser, onShiftDeleted, isLoading, error }) => {
  const handleDelete = async (shiftId: string) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) {
      return;
    }
    const response = await deleteShift(shiftId);
    if (response.data?.success) {
      onShiftDeleted();
    } else {
      alert((response.error as APIError).message || 'Failed to delete shift.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-100 rounded-md text-center">{error}</div>;
  }

  if (shifts.length === 0) {
    return <p className="text-center text-gray-500 p-4">No shifts found for the selected criteria.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Time
            </th>
            {currentUser.role === Role.ADMIN && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {shift.employeeName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {shift.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {shift.startTime}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {shift.endTime}
              </td>
              {currentUser.role === Role.ADMIN && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleDelete(shift.id)}
                    variant="danger"
                    className="py-1 px-2 text-xs"
                  >
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftTable;