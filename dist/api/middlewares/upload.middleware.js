"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadMiddleware = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../../common/errors");
const api_error_1 = require("../../common/error/api.error");
const logger_1 = __importDefault(require("../../common/logger"));
class UploadMiddleware {
}
exports.UploadMiddleware = UploadMiddleware;
_a = UploadMiddleware;
UploadMiddleware.uploadFiles = () => {
    /**
     * Middleware to handle file uploads.
     *
     * This function initializes a multer storage engine to store uploaded files in a specified directory.
     * It validates the number of uploaded files against the provided keys and returns a JSON response
     * containing the uploaded file URLs.
     *
     * @returns {Function} Express middleware function
     */
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let folderPath;
        folderPath = path_1.default.join(__dirname, '../../../uploads');
        try {
            yield fs_1.default.promises.access(folderPath);
        }
        catch (_b) {
            yield fs_1.default.promises.mkdir(folderPath, { recursive: true });
        }
        const storage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                cb(null, folderPath);
            },
            filename: (req, file, cb) => {
                const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
                const fileExtension = fileName.split('.').pop();
                const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
                const now = Date.now();
                cb(null, `${fileNameWithoutExt}-${now}.${fileExtension}`);
            },
        });
        const upload = (0, multer_1.default)({
            storage,
            limits: {
                fileSize: 20 * 1024 * 1024, // 20MB
            },
        }).any();
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                logger_1.default.error('UploadMiddleware error:', err);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new api_error_1.APIError({
                        message: 'common.too-large',
                        status: errors_1.StatusCode.BAD_REQUEST,
                    }));
                }
                return next(new api_error_1.APIError({
                    message: 'common.upload.error',
                    status: errors_1.StatusCode.SERVER_ERROR,
                }));
            }
            const files = req.files;
            let keys = req.body.keys;
            if (!Array.isArray(keys)) {
                keys = keys ? [keys] : [];
            }
            if (!files || files.length !== keys.length) {
                return next(new api_error_1.APIError({
                    message: 'common.upload.mismatch',
                    status: errors_1.StatusCode.BAD_REQUEST,
                }));
            }
            try {
                let uploadedUrls = {};
                files.forEach((file, index) => {
                    const fileUrl = `/uploads/${file.filename}`;
                    uploadedUrls[keys[index]] = fileUrl;
                });
                res.json(uploadedUrls);
            }
            catch (error) {
                logger_1.default.error('UploadMiddleware: Error during upload processing:', error);
                return next(new api_error_1.APIError({
                    message: 'common.upload.failed',
                    status: errors_1.StatusCode.SERVER_ERROR,
                }));
            }
        }));
    });
};
