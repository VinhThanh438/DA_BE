import moment, { Moment } from 'moment-timezone';

export class TimeHelper {
    private static timezone: string = 'Asia/Ho_Chi_Minh';

    /**
     * Get current timezone
     */
    public static getTimezone(): string {
        return this.timezone;
    }

    /**
     * Get current time
     */
    public static now(): Moment {
        return moment().tz(this.timezone);
    }

    /**
     * Get current date
     */
    public static getCurrentDate(): Date {
        return moment().tz(this.timezone).startOf('day').toDate();
    }

    /**
     * Format time to string
     */
    public static format(date: Date | string, formatStr: string = 'YYYY-MM-DD HH:mm:ss'): string {
        return this.parse(date).format(formatStr);
    }

    /**
     * Convert to UTC from local timezone
     */
    public static toUTC(date: Date | string): Moment {
        return this.parse(date).utc();
    }

    /**
     * Compare 2 dates in current timezone
     */
    public static isSame(
        date1: Date | string,
        date2: Date | string,
        granularity: moment.unitOfTime.StartOf = 'second',
    ): boolean {
        return this.parse(date1).isSame(this.parse(date2), granularity);
    }

    /**
     * Check if date is within a range
     */
    public static isBetween(
        date: Date | string,
        start: Date | string,
        end: Date | string,
        granularity: moment.unitOfTime.StartOf = 'second',
    ): boolean {
        return this.parse(date).isBetween(this.parse(start), this.parse(end), granularity, '[]');
    }

    /**
     * Parse input safely into Moment object in correct timezone
     */
    public static parse(date: Date | string): Moment {
        if (typeof date === 'string') {
            const formats = ['YYYY-M-D', 'YYYY-MM-DD', 'YYYY/M/D', 'YYYY/MM/DD'];
            const parsed = moment.tz(date, formats, true, this.timezone);
            if (parsed.isValid()) return parsed;
        }

        return moment.tz(date, this.timezone);
    }
    public static parseDay(date: Date | string): Moment {
        return moment.utc(date);
    }

    /**
     * Parse input to native Date object
     */
    public static parseToDate(date: string): Date {
        const parsed = this.parse(date);
        return parsed.toDate();
    }
    public static parseStartOfDayDate(date: string, formatStr: string = 'YYYY-MM-DD HH:mm:ss'): Date {
        return moment.utc(date).startOf('day').toDate();
    }
    public static parseEndOfDayDate(date: string, formatStr: string = 'YYYY-MM-DD HH:mm:ss'): Date {
        return moment.utc(date).endOf('day').toDate();
    }
}
