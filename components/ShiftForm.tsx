import React, { useState, useEffect } from 'react';
import { Employee, ShiftFormValues, APIError, User } from '../types';
import InputField from './InputField';
import SelectField from './SelectField';
import Button from './Button';
import { calculateShiftDurationInHours } from '../utils/dateUtils';
import { createShift, getEmployees } from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';

interface ShiftFormProps {
  currentUser: User;
  onShiftCreated: () => void; // Callback to refresh shifts after creation
}

const ShiftForm: React.FC<ShiftFormProps> = ({ currentUser, onShiftCreated }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(true);
  const [formValues, setFormValues] = useState<ShiftFormValues>({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShiftFormValues, string>>>({});
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      const response = await getEmployees();
      if (response.data) {
        setEmployees(response.data);
        if (response.data.length > 0) {
          setFormValues((prev) => ({ ...prev, employeeId: response.data[0].id }));
        }
      } else {
        setApiError((response.error as APIError).message || 'Failed to load employees.');
      }
      setIsLoadingEmployees(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchEmployees();
  }, []); // Only run once on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
    setFormErrors((prev) => ({ ...prev, [id]: undefined })); // Clear error on change
    setApiError(''); // Clear API error on change
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof ShiftFormValues, string>> = {};
    if (!formValues.employeeId) errors.employeeId = 'Employee is required.';
    if (!formValues.date) errors.date = 'Date is required.';
    if (!formValues.startTime) errors.startTime = 'Start time is required.';
    if (!formValues.endTime) errors.endTime = 'End time is required.';

    if (formValues.startTime && formValues.endTime) {
      const duration = calculateShiftDurationInHours(formValues.startTime, formValues.endTime);
      if (duration < 4) {
        errors.endTime = 'Shift must be a minimum of 4 hours.';
      }
      // Check if end time is before start time for same day shifts
      const startMinutes = calculateShiftDurationInHours('00:00', formValues.startTime);
      const endMinutes = calculateShiftDurationInHours('00:00', formValues.endTime);
      if (endMinutes <= startMinutes && duration >= 0) { // If end time is before start time on same day, but not crossing midnight
          errors.endTime = 'End time must be after start time.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const response = await createShift(formValues);
    setIsSubmitting(false);

    if (response.data) {
      alert('Shift created successfully!');
      onShiftCreated();
      setFormValues({ // Reset form
        employeeId: employees.length > 0 ? employees[0].id : '',
        date: '',
        startTime: '',
        endTime: '',
      });
    } else {
      setApiError((response.error as APIError).message || 'Failed to create shift.');
    }
  };

  if (isLoadingEmployees) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Assign New Shift (Admin Only)</h3>
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <SelectField
          id="employeeId"
          label="Employee"
          options={employees.map((emp) => ({ value: emp.id, label: `${emp.name} (${emp.employeeCode})` }))}
          value={formValues.employeeId}
          onChange={handleChange}
          error={formErrors.employeeId}
          required
        />
        <InputField
          id="date"
          label="Date"
          type="date"
          value={formValues.date}
          onChange={handleChange}
          error={formErrors.date}
          required
        />
        <InputField
          id="startTime"
          label="Start Time"
          type="time"
          value={formValues.startTime}
          onChange={handleChange}
          error={formErrors.startTime}
          required
        />
        <InputField
          id="endTime"
          label="End Time"
          type="time"
          value={formValues.endTime}
          onChange={handleChange}
          error={formErrors.endTime}
          required
        />
        <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
          Assign Shift
        </Button>
      </form>
    </div>
  );
};

export default ShiftForm;