"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodValidateQuery = exports.zodValidateBody = exports.ZodErrorCode = exports.ValidationErrorCode = void 0;
const api_error_1 = require("../../common/error/api.error");
const errors_1 = require("../../common/errors");
const logger_1 = __importDefault(require("../../common/logger"));
var ValidationErrorCode;
(function (ValidationErrorCode) {
    ValidationErrorCode["INVALID_TYPE"] = "invalid";
    ValidationErrorCode["REQUIRED"] = "require";
    ValidationErrorCode["INVALID_VALUES"] = "INVALID_VALUES";
    ValidationErrorCode["TOO_SHORT_OR_MIN"] = "TOO_SHORT_OR_MIN";
    ValidationErrorCode["TOO_LONG_OR_MAX"] = "TOO_LONG_OR_MAX";
    ValidationErrorCode["INVALID"] = "INVALID";
    ValidationErrorCode["DUPLICATE_ENTRY"] = "DUPLICATE_ENTRY";
    ValidationErrorCode["FOREIGN_KEY_VIOLATION"] = "FOREIGN_KEY_VIOLATION";
    ValidationErrorCode["NOT_NULL_VIOLATION"] = "NOT_NULL_VIOLATION";
    ValidationErrorCode["INVALID_JSON_FORMAT"] = "INVALID_JSON_FORMAT";
    ValidationErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    ValidationErrorCode["TOO_MANY_FILES"] = "TOO_MANY_FILES";
    ValidationErrorCode["INVALID_FIELD_NAME"] = "INVALID_FIELD_NAME";
    ValidationErrorCode["FILE_REQUIRED"] = "FILE_REQUIRED";
    ValidationErrorCode["INVALID_JSON"] = "INVALID_JSON";
})(ValidationErrorCode || (exports.ValidationErrorCode = ValidationErrorCode = {}));
// ErrorCode From ZodError
exports.ZodErrorCode = {
    invalid_type: ValidationErrorCode.INVALID_TYPE, // Kiểu dữ liệu không hợp lệ
    invalid_literal: ValidationErrorCode.INVALID, // Giá trị không đúng với literal đã khai báo
    unrecognized_keys: ValidationErrorCode.INVALID, // Object chứa các khóa không được định nghĩa trong schema
    invalid_union: ValidationErrorCode.INVALID_VALUES, // Không khớp với bất kỳ schema nào trong union
    invalid_union_discriminator: ValidationErrorCode.INVALID_VALUES, // Giá trị discriminator trong union không hợp lệ
    invalid_enum_value: ValidationErrorCode.INVALID_VALUES, // Giá trị không nằm trong danh sách enum hợp lệ
    invalid_arguments: ValidationErrorCode.INVALID, // Tham số hàm không hợp lệ (Zod function schema)
    invalid_return_type: ValidationErrorCode.INVALID_TYPE, // Kiểu trả về của hàm không hợp lệ
    invalid_date: ValidationErrorCode.INVALID_TYPE, // Giá trị không phải là ngày hợp lệ
    invalid_string: ValidationErrorCode.INVALID_TYPE, // Chuỗi không hợp lệ (ví dụ: sai định dạng email, regex, v.v.)
    too_small: ValidationErrorCode.TOO_SHORT_OR_MIN, // Giá trị nhỏ hơn giới hạn tối thiểu (áp dụng cho chuỗi, mảng, số, v.v.)
    too_big: ValidationErrorCode.TOO_LONG_OR_MAX, // Giá trị lớn hơn giới hạn tối đa (áp dụng cho chuỗi, mảng, số, v.v.)
    custom: ValidationErrorCode.INVALID, // Lỗi do người dùng tự định nghĩa trong refine hoặc superRefine
    invalid_intersection_types: ValidationErrorCode.INVALID, // Các schema giao nhau bị xung đột kiểu
    not_multiple_of: ValidationErrorCode.INVALID_VALUES, // Số không phải là bội số của một giá trị cụ thể
    not_finite: ValidationErrorCode.INVALID, // Số không hữu hạn (NaN, Infinity, -Infinity)
    invalid_instanceof: ValidationErrorCode.INVALID_TYPE, // Không đúng kiểu instance của class cụ thể
    invalid: ValidationErrorCode.INVALID, // Lỗi chung chung không xác định rõ nguyên nhân
};
const zodValidateBody = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            // Kiểm tra kết quả validation
            if (!result.success) {
                // Chuyển đổi lỗi Zod thành định dạng lỗi của ứng dụng
                const fieldErrors = result.error.errors.map((err) => {
                    logger_1.default.error(err);
                    const code = err.code === 'invalid_type' && err.received === 'undefined'
                        ? errors_1.ErrorKey.REQUIRED
                        : exports.ZodErrorCode[err.code] || err.code;
                    return `${err.path[0]}.${code}`;
                });
                return next(new api_error_1.APIError({ message: 'input.invalid', status: 400, errors: fieldErrors }));
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.zodValidateBody = zodValidateBody;
const zodValidateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            // Kiểm tra kết quả validation
            if (!result.success) {
                // Chuyển đổi lỗi Zod thành định dạng lỗi của ứng dụng
                const fieldErrors = result.error.errors.map((err) => {
                    logger_1.default.error(err);
                    const code = err.code === 'invalid_type' && err.received === 'undefined'
                        ? errors_1.ErrorKey.REQUIRED
                        : exports.ZodErrorCode[err.code] || err.code;
                    return `${err.path[0]}.${code}`;
                });
                return next(new api_error_1.APIError({ message: 'input.invalid', status: 400, errors: fieldErrors }));
            }
            // let query: any = {};
            // Object.keys(result.data).forEach((key) => {
            //     if(key === 'startAt' || key === 'endAt') {
            //         // Chuyển đổi startAt và endAt sang định dạng ISO nếu cần
            //         query[key] = new Date(result.data[key]).toISOString();
            //         return;
            //     } else {
            //         const snakeCaseKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
            //         query[snakeCaseKey] = result.data[key];
            //     }
            // });
            req.query = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.zodValidateQuery = zodValidateQuery;
