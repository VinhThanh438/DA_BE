"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorKey = exports.ErrorCode = exports.StatusCode = void 0;
/**
 * ErrorCode definition
 *
 * Success status:  2xx
 * Request error:   4xx
 * Server error:    5xx
 *
 * @export
 * @enum {number}
 */
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["NO_ERROR"] = 0] = "NO_ERROR";
    StatusCode[StatusCode["VERIFY_FAILED"] = 1] = "VERIFY_FAILED";
    // OK
    StatusCode[StatusCode["SUCCESS"] = 200] = "SUCCESS";
    StatusCode[StatusCode["CREATED"] = 201] = "CREATED";
    StatusCode[StatusCode["ACCEPTED"] = 202] = "ACCEPTED";
    StatusCode[StatusCode["NON_AUTHORITATIVE_INFO"] = 203] = "NON_AUTHORITATIVE_INFO";
    StatusCode[StatusCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    StatusCode[StatusCode["RESET_CONTENT"] = 205] = "RESET_CONTENT";
    StatusCode[StatusCode["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
    StatusCode[StatusCode["MULTI_STATUS"] = 207] = "MULTI_STATUS";
    StatusCode[StatusCode["ALREADY_REPORTED"] = 208] = "ALREADY_REPORTED";
    StatusCode[StatusCode["IM_USED"] = 226] = "IM_USED";
    // REQUEST ERROR
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCode[StatusCode["REQUEST_UNAUTHORIZED"] = 401] = "REQUEST_UNAUTHORIZED";
    StatusCode[StatusCode["REQUEST_FORBIDDEN"] = 403] = "REQUEST_FORBIDDEN";
    StatusCode[StatusCode["REQUEST_NOT_FOUND"] = 404] = "REQUEST_NOT_FOUND";
    StatusCode[StatusCode["REQUEST_METHOD_NOT_ALLOWED"] = 405] = "REQUEST_METHOD_NOT_ALLOWED";
    StatusCode[StatusCode["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
    StatusCode[StatusCode["REQUEST_TOO_MANY"] = 429] = "REQUEST_TOO_MANY";
    StatusCode[StatusCode["ACCOUNT_LOCKED"] = 423] = "ACCOUNT_LOCKED";
    // SERVER ERROR
    StatusCode[StatusCode["SERVER_ERROR"] = 500] = "SERVER_ERROR";
    StatusCode[StatusCode["SERVER_NOT_IMPLEMENTED"] = 501] = "SERVER_NOT_IMPLEMENTED";
    StatusCode[StatusCode["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    StatusCode[StatusCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    StatusCode[StatusCode["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
    StatusCode[StatusCode["SERVER_AUTH_ERROR"] = 511] = "SERVER_AUTH_ERROR";
})(StatusCode || (exports.StatusCode = StatusCode = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["NO_ERROR"] = 0] = "NO_ERROR";
    ErrorCode[ErrorCode["VERIFY_FAILED"] = 1] = "VERIFY_FAILED";
    // TOPIC ERROR
    ErrorCode[ErrorCode["SUCCESS"] = 200] = "SUCCESS";
    // REQUEST ERROR
    ErrorCode[ErrorCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ErrorCode[ErrorCode["REQUEST_UNAUTHORIZED"] = 401] = "REQUEST_UNAUTHORIZED";
    ErrorCode[ErrorCode["REQUEST_FORBIDDEN"] = 403] = "REQUEST_FORBIDDEN";
    ErrorCode[ErrorCode["REQUEST_NOT_FOUND"] = 404] = "REQUEST_NOT_FOUND";
    ErrorCode[ErrorCode["REQUEST_TOO_MANY"] = 429] = "REQUEST_TOO_MANY";
    ErrorCode[ErrorCode["ACCOUNT_LOCKED"] = 423] = "ACCOUNT_LOCKED";
    // SERVER ERROR
    ErrorCode[ErrorCode["SERVER_ERROR"] = 500] = "SERVER_ERROR";
    ErrorCode[ErrorCode["SERVER_AUTH_ERROR"] = 501] = "SERVER_AUTH_ERROR";
    ErrorCode[ErrorCode["NOT_FOUND"] = 502] = "NOT_FOUND";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
var ErrorKey;
(function (ErrorKey) {
    ErrorKey["NOT_FOUND"] = "not_found";
    ErrorKey["INVALID"] = "invalid";
    ErrorKey["REQUIRED"] = "required";
    ErrorKey["EXISTED"] = "existed";
    ErrorKey["INCORRECT"] = "incorrect";
    ErrorKey["FULFILLED"] = "fulfilled";
    ErrorKey["CANNOT_EDIT"] = "cannot_edit";
})(ErrorKey || (exports.ErrorKey = ErrorKey = {}));
