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
exports.UserEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const employee_service_1 = require("../services/employee.service");
const event_constant_1 = require("../../config/event.constant");
class UserEvent {
    /**
     * Register user event
     */
    static register() {
        eventbus_1.default.on(event_constant_1.EVENT_USER_CREATED_OR_DELETED, this.updateEmployeeStatusHandler);
    }
    static updateEmployeeStatusHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.employeeService.update(body.employeeId, { has_user_account: body.status });
                logger_1.default.info('UserEvent.updateEmployeeStatusHandler: Employee status updated successfully!');
            }
            catch (error) {
                logger_1.default.error('UserEvent.updateEmployeeStatusHandler:', error.message);
            }
        });
    }
}
exports.UserEvent = UserEvent;
UserEvent.employeeService = employee_service_1.EmployeeService.getInstance();
