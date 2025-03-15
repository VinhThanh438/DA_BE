/**
 * ErrorCode definition
 *
 * Request error:   4xx
 * Server error:    5xx
 *
 * @export
 * @enum {number}
 */
export enum ErrorCode {
    NO_ERROR = 0,

    VERIFY_FAILED = 1,

    // TOPIC ERROR
    SUCCESS = 200,

    // REQUEST ERROR
    BAD_REQUEST = 400,
    REQUEST_UNAUTHORIZED = 401,
    REQUEST_FORBIDDEN = 403,
    REQUEST_NOT_FOUND = 404,
    REQUEST_TOO_MANY = 429,
    ACCOUNT_LOCKED = 423,

    // SERVER ERROR
    SERVER_ERROR = 500,
    SERVER_AUTH_ERROR = 501, // and not know why
}
