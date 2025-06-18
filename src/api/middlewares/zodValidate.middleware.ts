import { APIError } from '@common/error/api.error';
import { ErrorKey } from '@common/errors';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export enum ValidationErrorCode {
    INVALID_TYPE = 'invalid', // Kiểu dữ liệu không hợp lệ
    REQUIRED = 'require', // Giá trị bắt buộc không được để trống
    INVALID_VALUES = 'INVALID_VALUES', // Giá trị không nằm trong danh sách giá trị hợp lệ
    TOO_SHORT_OR_MIN = 'TOO_SHORT_OR_MIN', // Giá trị nhỏ hơn giới hạn tối thiểu (áp dụng cho chuỗi, mảng, số, v.v.)
    TOO_LONG_OR_MAX = 'TOO_LONG_OR_MAX', // Giá trị lớn hơn giới hạn tối đa (áp dụng cho chuỗi, mảng, số, v.v.)
    INVALID = 'INVALID', // Giá trị không hợp lệ
    DUPLICATE_ENTRY = 'DUPLICATE_ENTRY', // Vi phạm ràng buộc duy nhất
    FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION', // Vi phạm ràng buộc khóa ngoại
    NOT_NULL_VIOLATION = 'NOT_NULL_VIOLATION', // Vi phạm ràng buộc không null
    INVALID_JSON_FORMAT = 'INVALID_JSON_FORMAT', // Định dạng JSON không hợp lệ
    FILE_TOO_LARGE = 'FILE_TOO_LARGE', // File quá lớn
    TOO_MANY_FILES = 'TOO_MANY_FILES', // Quá nhiều file được tải lên
    INVALID_FIELD_NAME = 'INVALID_FIELD_NAME', // Tên loại File không hợp lệ
    FILE_REQUIRED = 'FILE_REQUIRED', // File là bắt buộc
    INVALID_JSON = 'INVALID_JSON', // Định dạng JSON không hợp lệ
}

// ErrorCode From ZodError
export const ZodErrorCode: Record<string, string> = {
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

export const zodValidateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            console.log(req.body);
            const result = schema.safeParse(req.body);

            // Kiểm tra kết quả validation
            if (!result.success) {
                // Chuyển đổi lỗi Zod thành định dạng lỗi của ứng dụng
                const fieldErrors = result.error.errors.map((err) => {
                    console.log(err);
                    const code =
                        err.code === 'invalid_type' && err.received === 'undefined'
                            ? ErrorKey.REQUIRED
                            : ZodErrorCode[err.code] || err.code;
                    return `${err.path[0]}.${code}`;
                });

                return next(new APIError({ message: 'input.invalid', status: 400, errors: fieldErrors }));
            }

            req.body = result.data;
            console.log('query data chuẩn hoá:', result.data);
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const zodValidateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            console.log(req.query);
            const result = schema.safeParse(req.query);

            // Kiểm tra kết quả validation
            if (!result.success) {
                // Chuyển đổi lỗi Zod thành định dạng lỗi của ứng dụng
                const fieldErrors = result.error.errors.map((err) => {
                    console.log(err);
                    const code =
                        err.code === 'invalid_type' && err.received === 'undefined'
                            ? ErrorKey.REQUIRED
                            : ZodErrorCode[err.code] || err.code;
                    return `${err.path[0]}.${code}`;
                });

                return next(new APIError({ message: 'input.invalid', status: 400, errors: fieldErrors }));
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

            console.log('query data chuẩn hoá:', result.data);
            next();
        } catch (error) {
            next(error);
        }
    };
};
