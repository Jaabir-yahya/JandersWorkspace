"use strict";
/**
 * Kenyan Holiday Calendar
 * Public holidays and business days calculation for Kenya
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKenyanHolidays = getKenyanHolidays;
exports.isPublicHoliday = isPublicHoliday;
exports.isWeekend = isWeekend;
exports.isBusinessDay = isBusinessDay;
exports.getNextBusinessDay = getNextBusinessDay;
exports.getPreviousBusinessDay = getPreviousBusinessDay;
exports.countBusinessDays = countBusinessDays;
exports.getHolidaysInRange = getHolidaysInRange;
exports.getHolidayName = getHolidayName;
exports.getUpcomingHolidays = getUpcomingHolidays;
exports.addBusinessDays = addBusinessDays;
/**
 * Fixed holidays in Kenya (same date every year)
 */
const FIXED_HOLIDAYS = [
    { name: "New Year's Day", swahiliName: 'Siku ya Mwaka Mpya', month: 0, day: 1, description: 'First day of the year' },
    { name: 'Labour Day', swahiliName: 'Siku ya Wafanyakazi', month: 4, day: 1, description: 'International Workers Day' },
    { name: 'Madaraka Day', swahiliName: 'Siku ya Madaraka', month: 5, day: 1, description: 'Self-governance day' },
    { name: 'Mashujaa Day', swahiliName: 'Siku ya Mashujaa', month: 9, day: 20, description: 'Heroes Day' },
    { name: 'Jamhuri Day', swahiliName: 'Siku ya Jamhuri', month: 11, day: 12, description: 'Independence Day' },
    { name: 'Christmas Day', swahiliName: 'Siku ya Krismasi', month: 11, day: 25, description: 'Christmas' },
    { name: 'Boxing Day', swahiliName: 'Siku ya Boksi', month: 11, day: 26, description: 'Day after Christmas' },
];
/**
 * Calculate Easter date for a given year (Western Christian)
 * Uses the Anonymous Gregorian algorithm
 * @param year - The year to calculate Easter for
 * @returns Date of Easter Sunday
 */
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed month
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}
/**
 * Calculate Good Friday date
 * @param year - The year
 * @returns Date of Good Friday
 */
function calculateGoodFriday(year) {
    const easter = calculateEaster(year);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    return goodFriday;
}
/**
 * Calculate Easter Monday date
 * @param year - The year
 * @returns Date of Easter Monday
 */
function calculateEasterMonday(year) {
    const easter = calculateEaster(year);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);
    return easterMonday;
}
/**
 * Calculate Idd-ul-Fitr (approximate - based on Islamic calendar)
 * This is an approximation as the exact date depends on moon sighting
 * @param year - The Gregorian year
 * @returns Approximate date of Idd-ul-Fitr
 */
function calculateIddUlFitr(year) {
    // Approximate dates for Idd-ul-Fitr (Islamic calendar shifts ~11 days earlier each Gregorian year)
    const approximateDates = {
        2024: { month: 3, day: 10 }, // April 10, 2024
        2025: { month: 2, day: 30 }, // March 30, 2025
        2026: { month: 2, day: 20 }, // March 20, 2026
        2027: { month: 2, day: 9 }, // March 9, 2027
        2028: { month: 1, day: 26 }, // February 26, 2028
        2029: { month: 1, day: 15 }, // February 15, 2029
        2030: { month: 0, day: 5 }, // January 5, 2030
    };
    const date = approximateDates[year];
    if (date) {
        return new Date(year, date.month, date.day);
    }
    // Fallback approximation: shift back ~11 days per year from known date
    const baseYear = 2024;
    const baseDate = new Date(2024, 3, 10); // April 10, 2024
    const yearDiff = year - baseYear;
    const daysToSubtract = yearDiff * 11;
    const result = new Date(baseDate);
    result.setDate(baseDate.getDate() - daysToSubtract);
    return result;
}
/**
 * Calculate Idd-ul-Adha (approximate - based on Islamic calendar)
 * @param year - The Gregorian year
 * @returns Approximate date of Idd-ul-Adha
 */
function calculateIddUlAdha(year) {
    // Idd-ul-Adha is approximately 70 days after Idd-ul-Fitr
    const iddUlFitr = calculateIddUlFitr(year);
    const iddUlAdha = new Date(iddUlFitr);
    iddUlAdha.setDate(iddUlFitr.getDate() + 70);
    return iddUlAdha;
}
/**
 * Get all Kenyan holidays for a specific year
 * @param year - The year to get holidays for
 * @returns Array of Kenyan holidays
 */
function getKenyanHolidays(year) {
    const holidays = [];
    // Add fixed holidays
    for (const holiday of FIXED_HOLIDAYS) {
        holidays.push({
            name: holiday.name,
            swahiliName: holiday.swahiliName,
            date: new Date(year, holiday.month, holiday.day),
            type: 'fixed',
            description: holiday.description,
            isPublicHoliday: true,
        });
    }
    // Add movable Christian holidays
    const goodFriday = calculateGoodFriday(year);
    holidays.push({
        name: 'Good Friday',
        swahiliName: 'Ijumaa Kuu',
        date: goodFriday,
        type: 'movable',
        description: 'Christian holiday before Easter',
        isPublicHoliday: true,
    });
    const easterMonday = calculateEasterMonday(year);
    holidays.push({
        name: 'Easter Monday',
        swahiliName: 'Jumatatu ya Pasaka',
        date: easterMonday,
        type: 'movable',
        description: 'Day after Easter Sunday',
        isPublicHoliday: true,
    });
    // Add Islamic holidays (approximate dates)
    const iddUlFitr = calculateIddUlFitr(year);
    holidays.push({
        name: 'Idd-ul-Fitr',
        swahiliName: 'Idd-ul-Fitr',
        date: iddUlFitr,
        type: 'religious',
        description: 'End of Ramadan (Islamic)',
        isPublicHoliday: true,
    });
    const iddUlAdha = calculateIddUlAdha(year);
    holidays.push({
        name: 'Idd-ul-Adha',
        swahiliName: 'Idd-ul-Adha',
        date: iddUlAdha,
        type: 'religious',
        description: 'Feast of Sacrifice (Islamic)',
        isPublicHoliday: true,
    });
    // Sort by date
    return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}
/**
 * Check if a date is a Kenyan public holiday
 * @param date - The date to check
 * @returns True if the date is a public holiday
 */
function isPublicHoliday(date) {
    const year = date.getFullYear();
    const holidays = getKenyanHolidays(year);
    return holidays.some((holiday) => holiday.date.getDate() === date.getDate() &&
        holiday.date.getMonth() === date.getMonth() &&
        holiday.isPublicHoliday);
}
/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - The date to check
 * @returns True if the date is a weekend
 */
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}
/**
 * Check if a date is a business day (not weekend and not holiday)
 * @param date - The date to check
 * @returns True if the date is a business day
 */
function isBusinessDay(date) {
    return !isWeekend(date) && !isPublicHoliday(date);
}
/**
 * Get the next business day from a given date
 * @param date - The starting date
 * @param daysToAdd - Number of business days to add (default 1)
 * @returns The next business day
 */
function getNextBusinessDay(date, daysToAdd = 1) {
    const result = new Date(date);
    let businessDaysAdded = 0;
    while (businessDaysAdded < daysToAdd) {
        result.setDate(result.getDate() + 1);
        if (isBusinessDay(result)) {
            businessDaysAdded++;
        }
    }
    return result;
}
/**
 * Get the previous business day from a given date
 * @param date - The starting date
 * @param daysToSubtract - Number of business days to subtract (default 1)
 * @returns The previous business day
 */
function getPreviousBusinessDay(date, daysToSubtract = 1) {
    const result = new Date(date);
    let businessDaysSubtracted = 0;
    while (businessDaysSubtracted < daysToSubtract) {
        result.setDate(result.getDate() - 1);
        if (isBusinessDay(result)) {
            businessDaysSubtracted++;
        }
    }
    return result;
}
/**
 * Count business days between two dates (inclusive)
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Number of business days
 */
function countBusinessDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
        if (isBusinessDay(current)) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}
/**
 * Get holidays in a date range
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Array of holidays in the range
 */
function getHolidaysInRange(startDate, endDate) {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const allHolidays = [];
    for (let year = startYear; year <= endYear; year++) {
        allHolidays.push(...getKenyanHolidays(year));
    }
    return allHolidays.filter((holiday) => holiday.date >= startDate && holiday.date <= endDate);
}
/**
 * Get holiday name for a specific date
 * @param date - The date to check
 * @returns Holiday name or null if not a holiday
 */
function getHolidayName(date) {
    const year = date.getFullYear();
    const holidays = getKenyanHolidays(year);
    const holiday = holidays.find((h) => h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth() &&
        h.isPublicHoliday);
    return holiday ? { name: holiday.name, swahiliName: holiday.swahiliName } : null;
}
/**
 * Get upcoming holidays from a given date
 * @param fromDate - The date to start from (defaults to today)
 * @param count - Number of holidays to return (default 5)
 * @returns Array of upcoming holidays
 */
function getUpcomingHolidays(fromDate = new Date(), count = 5) {
    const year = fromDate.getFullYear();
    const holidays = getKenyanHolidays(year);
    // Also get next year's holidays if needed
    const nextYearHolidays = getKenyanHolidays(year + 1);
    const allHolidays = [...holidays, ...nextYearHolidays];
    return allHolidays
        .filter((h) => h.date > fromDate)
        .slice(0, count);
}
/**
 * Add business days to a date
 * @param date - The starting date
 * @param businessDays - Number of business days to add
 * @returns The resulting date
 */
function addBusinessDays(date, businessDays) {
    if (businessDays >= 0) {
        return getNextBusinessDay(date, businessDays);
    }
    else {
        return getPreviousBusinessDay(date, Math.abs(businessDays));
    }
}
