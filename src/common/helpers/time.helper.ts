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
     * Format time
     */
    public static format(date: Date | string, formatStr: string = 'YYYY-MM-DD HH:mm:ss'): string {
        return moment(date).tz(this.timezone).format(formatStr);
    }

    /**
     * Parse from timezone to UTC
     */
    public static toUTC(date: Date | string): Moment {
        return moment.tz(date, this.timezone).utc();
    }

    /**
     * Compare two datetime values based on the current timezone
    */
    public static isSame(
        date1: Date | string,
        date2: Date | string,
        granularity: moment.unitOfTime.StartOf = 'second',
    ): boolean {
        return moment(date1).tz(this.timezone).isSame(moment(date2).tz(this.timezone), granularity);
    }

    /**
     * Check if a time is within a specific range
    */
    public static isBetween(
        date: Date | string,
        start: Date | string,
        end: Date | string,
        granularity: moment.unitOfTime.StartOf = 'second',
    ): boolean {
        return moment(date)
            .tz(this.timezone)
            .isBetween(moment(start).tz(this.timezone), moment(end).tz(this.timezone), granularity, '[]');
    }
}
