/**
 * Kenyan Holiday Calendar
 * Public holidays and business days calculation for Kenya
 */
/**
 * Kenyan public holiday
 */
export interface KenyanHoliday {
    name: string;
    swahiliName: string;
    date: Date;
    type: 'fixed' | 'movable' | 'religious';
    description?: string;
    isPublicHoliday: boolean;
}
/**
 * Get all Kenyan holidays for a specific year
 * @param year - The year to get holidays for
 * @returns Array of Kenyan holidays
 */
export declare function getKenyanHolidays(year: number): KenyanHoliday[];
/**
 * Check if a date is a Kenyan public holiday
 * @param date - The date to check
 * @returns True if the date is a public holiday
 */
export declare function isPublicHoliday(date: Date): boolean;
/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - The date to check
 * @returns True if the date is a weekend
 */
export declare function isWeekend(date: Date): boolean;
/**
 * Check if a date is a business day (not weekend and not holiday)
 * @param date - The date to check
 * @returns True if the date is a business day
 */
export declare function isBusinessDay(date: Date): boolean;
/**
 * Get the next business day from a given date
 * @param date - The starting date
 * @param daysToAdd - Number of business days to add (default 1)
 * @returns The next business day
 */
export declare function getNextBusinessDay(date: Date, daysToAdd?: number): Date;
/**
 * Get the previous business day from a given date
 * @param date - The starting date
 * @param daysToSubtract - Number of business days to subtract (default 1)
 * @returns The previous business day
 */
export declare function getPreviousBusinessDay(date: Date, daysToSubtract?: number): Date;
/**
 * Count business days between two dates (inclusive)
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Number of business days
 */
export declare function countBusinessDays(startDate: Date, endDate: Date): number;
/**
 * Get holidays in a date range
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Array of holidays in the range
 */
export declare function getHolidaysInRange(startDate: Date, endDate: Date): KenyanHoliday[];
/**
 * Get holiday name for a specific date
 * @param date - The date to check
 * @returns Holiday name or null if not a holiday
 */
export declare function getHolidayName(date: Date): {
    name: string;
    swahiliName: string;
} | null;
/**
 * Get upcoming holidays from a given date
 * @param fromDate - The date to start from (defaults to today)
 * @param count - Number of holidays to return (default 5)
 * @returns Array of upcoming holidays
 */
export declare function getUpcomingHolidays(fromDate?: Date, count?: number): KenyanHoliday[];
/**
 * Add business days to a date
 * @param date - The starting date
 * @param businessDays - Number of business days to add
 * @returns The resulting date
 */
export declare function addBusinessDays(date: Date, businessDays: number): Date;
//# sourceMappingURL=holiday-calendar.d.ts.map