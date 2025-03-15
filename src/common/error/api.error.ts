import { ErrorCode } from '@common/errors';
import { errors } from 'express-validation';

interface APIErrorParams {
    message: string;
    errors?: errors;
    stack?: string;
    errorCode?: number;
    status?: number;
    isPublic?: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    message_data?: object;
}

/**
 * Class representing an API error.
 */
export class APIError extends Error {
    public status: number;
    public errorCode?: number;
    public isPublic: boolean;
    public errors?: errors;
    // eslint-disable-next-line @typescript-eslint/ban-types
    public message_data?: object;
    public statusCode: number;

    /**
     * Creates an API error.
     * @param {APIErrorParams} params - API error parameters.
     */
    constructor({
        message,
        errors: errs,
        stack,
        errorCode,
        status = ErrorCode.SERVER_ERROR,
        isPublic = false,
        message_data = null,
    }: APIErrorParams) {
        super(message);
        this.stack = stack;
        this.status = status;
        this.isPublic = isPublic;
        this.errors = errs;
        this.statusCode = status; // Thêm status_code

        if (errorCode === undefined || errorCode === 0) {
            this.errorCode = status >= 500 ? ErrorCode.SERVER_ERROR : ErrorCode.VERIFY_FAILED;
        } else {
            this.errorCode = errorCode;
        }
        this.message_data = message_data;
    }
}
