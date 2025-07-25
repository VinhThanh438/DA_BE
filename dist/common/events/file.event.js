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
exports.FileEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const delete_file_system_1 = require("../helpers/delete-file-system");
const logger_1 = __importDefault(require("../logger"));
const event_constant_1 = require("../../config/event.constant");
class FileEvent {
    /**
     * Register File event
     */
    static register() {
        eventbus_1.default.on(event_constant_1.EVENT_DELETE_UNUSED_FILES, this.deleteUnusedFilesHandler.bind(this));
    }
    static deleteUnusedFilesHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, delete_file_system_1.deleteFileSystem)(body);
                logger_1.default.info('FileEvent.deleteUnusedFilesHandler: Unused files deleted successfully.');
            }
            catch (error) {
                logger_1.default.error('FileEvent.deleteUnusedFilesHandler:', error);
            }
        });
    }
}
exports.FileEvent = FileEvent;
