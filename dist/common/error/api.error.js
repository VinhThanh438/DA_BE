"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = void 0;
const errors_1 = require("../errors");
/**
 * Class representing an API error.
 */
class APIError extends Error {
    /**
     * Creates an API error.
     * @param {APIErrorParams} params - API error parameters.
     */
    constructor({ message, errors, stack, errorCode, status = errors_1.StatusCode.SERVER_ERROR, isPublic = false, messageData = null, }) {
        super(message);
        this.stack = stack;
        this.status = status;
        this.isPublic = isPublic;
        this.errors = errors;
        this.statusCode = status;
        if (errorCode === undefined || errorCode === 0) {
            this.errorCode = status >= 500 ? errors_1.ErrorCode.SERVER_ERROR : errors_1.ErrorCode.VERIFY_FAILED;
        }
        else {
            this.errorCode = errorCode;
        }
        this.messageData = messageData;
    }
}
exports.APIError = APIError;
