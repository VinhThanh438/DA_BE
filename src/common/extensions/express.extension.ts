import express from 'express';
import { StatusCode } from '@common/errors';
import { IRequestInfo } from '@common/interfaces/request.interface';
import requestIp from 'request-ip';

/**
 * Extends the Express Response object by adding a custom `sendJson` method.
 * This method is designed to standardize the JSON response format for consistency
 * across the application, ensuring that all responses follow a consistent structure.
 *
 * The response will always include the following properties:
 * - `error_code`: A standard error code (0 for success).
 * - `status_code`: The HTTP status code (200 for success).
 * - `message`: A custom message or a default message ('OK').
 * - `data`: The actual response data (could be an array or an object).
 * - `pagination`: Pagination details, if applicable (included when the data has a `pagination` field).
 *
 * If the `data` object contains both `data` and `pagination` fields, the response will include both.
 * If only a single data object or array is provided, it will be returned directly as `data`.
 *
 * @param {object | any[]} [data] - The data to be sent in the response.
 *     It can be an object, an array, or an object that includes both `data` and `pagination` fields.
 * @returns {Response} The Express response object with the standardized JSON structure.
 */
express.response.sendJson = function (data?: object | any[]) {
    const isArray = Array.isArray(data);
    const isObject = typeof data === 'object' && data !== null && !isArray;
    const isPrimitive = typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean';

    if (
        isObject &&
        (data as { data: any[]; pagination: object }).data &&
        (data as { data: any[]; pagination: object }).pagination
    ) {
        const response: any = {
            errorCode: 0,
            statusCode: StatusCode.SUCCESS,
            message: (data as { message?: string })?.message || 'OK',
            data: (data as { data: any[] }).data,
            pagination: (data as { pagination: object }).pagination,
        };

        if ((data as any).summary) {
            response.summary = (data as any).summary;
        }

        return this.json(response);
    }

    return this.json({
        errorCode: 0,
        statusCode: StatusCode.SUCCESS,
        message: (isObject && (data as { message?: string })?.message) || 'OK',
        ...(isArray ? { data } : isObject ? { data } : isPrimitive ? { data } : {}),
    });
};

/**
 * Extends the Express Request object with a `getRequestInfo` method.
 * This method extracts useful metadata from the request, such as the client IP and User-Agent.
 *
 * @returns {IRequestInfo} An object containing request metadata.
 */
express.request.getRequestInfo = function (): IRequestInfo {
    return {
        ip: requestIp.getClientIp(this) ?? undefined,
        ua: this.header('User-Agent') || undefined,
        device: (this.query.deviceId as string) || undefined,
    };
};
