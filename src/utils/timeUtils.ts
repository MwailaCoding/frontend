/**
 * Formats preparation time from minutes to a human-readable format
 * @param minutes - Total minutes
 * @returns Formatted time string (e.g., "2h 30m" or "45m")
 */
export const formatPreparationTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Converts hours and minutes to total minutes
 * @param hours - Hours
 * @param minutes - Minutes
 * @returns Total minutes
 */
export const timeToMinutes = (hours: number, minutes: number): number => {
  return hours * 60 + minutes;
};

/**
 * Converts total minutes to hours and minutes
 * @param totalMinutes - Total minutes
 * @returns Object with hours and minutes
 */
export const minutesToTime = (totalMinutes: number): { hours: number; minutes: number } => {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
};





