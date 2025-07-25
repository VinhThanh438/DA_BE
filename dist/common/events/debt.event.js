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
exports.DebtEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const debt_repo_1 = require("../repositories/debt.repo");
const event_constant_1 = require("../../config/event.constant");
class DebtEvent {
    /**
     * Register Debt event
     */
    static register() {
        eventbus_1.default.on(event_constant_1.EVENT_DEBT_INCURRED, this.DebtIncurredHandler.bind(this));
    }
    static DebtIncurredHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.debtRepo.create(body);
                logger_1.default.info('DebtEvent.DebtIncurredHandler: Debt created successfully!');
            }
            catch (error) {
                logger_1.default.error('DebtEvent.DebtIncurredHandler:', error);
            }
        });
    }
}
exports.DebtEvent = DebtEvent;
DebtEvent.debtRepo = new debt_repo_1.DebtRepo();
