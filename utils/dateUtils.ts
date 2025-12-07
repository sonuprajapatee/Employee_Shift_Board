/**
 * Converts HH:mm time string to minutes from midnight.
 * @param timeString - Time in HH:mm format.
 * @returns Total minutes from midnight.
 */
export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks if two shifts overlap on the same date.
 * @param shift1 - The first shift object.
 * @param shift2 - The second shift object.
 * @returns True if shifts overlap, false otherwise.
 */
export const doShiftsOverlap = (
  shift1: { date: string; startTime: string; endTime: string },
  shift2: { date: string; startTime: string; endTime: string },
): boolean => {
  if (shift1.date !== shift2.date) {
    return false;
  }

  const start1 = timeToMinutes(shift1.startTime);
  const end1 = timeToMinutes(shift1.endTime);
  const start2 = timeToMinutes(shift2.startTime);
  const end2 = timeToMinutes(shift2.endTime);

  // A shift `A` (start1, end1) and shift `B` (start2, end2) overlap if:
  // (start1 < end2 AND start2 < end1)
  return (start1 < end2 && start2 < end1);
};

/**
 * Calculates the duration of a shift in hours.
 * @param startTime - Shift start time in HH:mm format.
 * @param endTime - Shift end time in HH:mm format.
 * @returns Duration in hours.
 */
export const calculateShiftDurationInHours = (startTime: string, endTime: string): number => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Handle shifts crossing midnight (assume shifts are within a 24-hour period for simplicity)
  // For more complex scenarios, actual Date objects would be needed.
  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) { // e.g., 22:00 to 02:00
    durationMinutes += 24 * 60; // Add 24 hours
  }

  return durationMinutes / 60;
};

/**
 * Formats a Date object to YYYY-MM-DD string.
 * @param date - Date object.
 * @returns Formatted date string.
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a Date object to HH:mm string.
 * @param date - Date object.
 * @returns Formatted time string.
 */
export const formatTimeToHHMM = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Combines a date string (YYYY-MM-DD) and a time string (HH:mm) into a Date object.
 * @param dateStr - Date string (YYYY-MM-DD).
 * @param timeStr - Time string (HH:mm).
 * @returns A Date object, or null if parsing fails.
 */
export const combineDateTime = (dateStr: string, timeStr: string): Date | null => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Month is 0-indexed in Date constructor
    const date = new Date(year, month - 1, day, hours, minutes);
    return date;
  } catch (error) {
    console.error('Error combining date and time:', error);
    return null;
  }
};
