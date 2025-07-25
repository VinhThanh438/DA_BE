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
exports.WorkerServer = void 0;
const logger_1 = __importDefault(require("../common/logger"));
const router_1 = require("./router");
/**
 * Abstraction around bullmq processor (Worker manager)
 */
class WorkerServer {
    constructor() {
        this.workers = [];
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.workers = yield router_1.Router.register();
            logger_1.default.info(`WorkerServer: ${this.workers.length} jobs registered.`);
        });
    }
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = this.workers.map((item) => {
                var _a;
                return (_a = item.worker) === null || _a === void 0 ? void 0 : _a.close().catch((e) => {
                    logger_1.default.error('Error closing worker', e);
                });
            });
            yield Promise.all(promises);
            logger_1.default.info('WorkerServer: all jobs closed.');
        });
    }
}
exports.WorkerServer = WorkerServer;
