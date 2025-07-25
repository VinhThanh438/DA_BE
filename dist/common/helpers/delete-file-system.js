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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileSystem = deleteFileSystem;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../logger"));
function deleteFileSystem(filesToDelete) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!filesToDelete || filesToDelete.length === 0) {
            logger_1.default.info('No files to delete.');
            return;
        }
        // Set root folder path to project root
        const ROOT_FOLDER = path_1.default.join(__dirname, '../../..');
        yield Promise.all(filesToDelete.map((filename) => __awaiter(this, void 0, void 0, function* () {
            let filePath;
            if (filename.startsWith('/uploads/') || filename.startsWith('uploads/')) {
                filePath = path_1.default.join(ROOT_FOLDER, filename.startsWith('/') ? filename.substring(1) : filename);
            }
            else {
                filePath = path_1.default.join(ROOT_FOLDER, 'uploads', filename);
            }
            logger_1.default.info(`remove file -> path = ${filePath}`);
            try {
                yield fs_1.default.promises.access(filePath);
                yield fs_1.default.promises.unlink(filePath);
                logger_1.default.info(`Successfully deleted file: ${filename}`);
            }
            catch (error) {
                logger_1.default.warn(`File does not exist or cannot be deleted: ${filePath}`);
            }
        })));
    });
}
