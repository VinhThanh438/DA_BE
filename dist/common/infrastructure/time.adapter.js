"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeAdapter = void 0;
const app_constant_1 = require("../../config/app.constant");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class TimeAdapter {
    /**
     * Get current timezone
     */
    static getTimezone() {
        return this.timezone;
    }
    static setTimezone(timezone) {
        if (moment_timezone_1.default.tz.zone(timezone)) {
            this.timezone = timezone;
        }
    }
    /**
     * Get current time
     */
    static now() {
        return (0, moment_timezone_1.default)().tz(this.timezone);
    }
    static currentDate() {
        return this.now().toDate();
    }
    /**
     * Get current date
     */
    static getCurrentDate() {
        return (0, moment_timezone_1.default)().tz(this.timezone).startOf('day').toDate();
    }
    /**
     * Format time to string
     */
    static format(date, formatStr = 'YYYY-MM-DD HH:mm:ss') {
        return this.parse(date).format(formatStr);
    }
    /**
     * Convert to UTC from local timezone
     */
    static toUTC(date) {
        return this.parse(date).utc();
    }
    /**
     * Compare 2 dates in current timezone
     */
    static isSame(date1, date2, granularity = 'second') {
        return this.parse(date1).isSame(this.parse(date2), granularity);
    }
    /**
     * Check if date is within a range
     */
    static isBetween(date, start, end, granularity = 'second') {
        return this.parse(date).isBetween(this.parse(start), this.parse(end), granularity, '[]');
    }
    /**
     * Parse input safely into Moment object in correct timezone
     */
    static parse(date) {
        if (typeof date === 'string') {
            const formats = this.dateFormats;
            const parsed = moment_timezone_1.default.tz(date, formats, true, this.timezone);
            if (parsed.isValid())
                return parsed;
        }
        return moment_timezone_1.default.tz(date, this.timezone);
    }
    static parseDay(date) {
        if (typeof date === 'string') {
            const formats = this.dateFormats;
            const parsed = moment_timezone_1.default.tz(date, formats, true, this.timezone);
            if (parsed.isValid())
                return parsed.startOf('day');
        }
        return moment_timezone_1.default.tz(date, this.timezone).startOf('day');
    }
    /**
     * Parse input to native Date object
     */
    static parseToDate(date) {
        const parsed = this.parse(date);
        return parsed.toDate();
    }
    static parseStartOfDayDate(date) {
        return moment_timezone_1.default.utc(date).startOf('day').toDate();
    }
    static parseEndOfDayDate(date) {
        return moment_timezone_1.default.utc(date).endOf('day').toDate();
    }
    /**
     * Get day of month from ISO datetime string (e.g., '2025-06-05T12:00:00Z' → 5)
     */
    static getDayOfMonth(date) {
        return moment_timezone_1.default.tz(date, this.timezone).date();
    }
    /**
     * Get number of days from input date to target day
     */
    static getDistanceToNearestPastDay(date, targetDay) {
        const input = moment_timezone_1.default.tz(date, this.timezone).startOf('day');
        const targetMoment = moment_timezone_1.default.tz(targetDay, this.timezone);
        const targetDayOfMonth = targetMoment.date();
        let candidate = input.clone().date(targetDayOfMonth);
        if (candidate.isAfter(input)) {
            candidate = input.clone().subtract(1, 'month').date(targetDayOfMonth);
        }
        while (!candidate.isValid()) {
            candidate = candidate.clone().subtract(1, 'day');
        }
        const diff = input.diff(candidate, 'days');
        return diff >= 0 ? diff : 0;
    }
    static toISOStringUTC(date) {
        return this.toUTC(date).toISOString();
    }
}
exports.TimeAdapter = TimeAdapter;
TimeAdapter.timezone = app_constant_1.DEFAULT_TIME_ZONE;
TimeAdapter.dateFormats = ['YYYY-M-D', 'YYYY-MM-DD', 'YYYY/M/D', 'YYYY/MM/DD'];
