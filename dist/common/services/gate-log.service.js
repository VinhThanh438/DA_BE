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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateLogService = void 0;
const base_service_1 = require("./master/base.service");
const gate_log_repo_1 = require("../repositories/gate-log.repo");
const user_repo_1 = require("../repositories/user.repo");
const app_constant_1 = require("../../config/app.constant");
class GateLogService extends base_service_1.BaseService {
    constructor() {
        super(new gate_log_repo_1.GateLogRepo());
        this.userRepo = new user_repo_1.UserRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new GateLogService();
        }
        return this.instance;
    }
    assignEmployee(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findById(id);
            yield this.repo.update({ id }, { status: app_constant_1.CommonApproveStatus.CONFIRMED, employee_id: body.employee_id });
            return { id };
        });
    }
    updateGateLog(id, body, isAdmin, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gateLog = yield this.findById(id);
            if (!gateLog)
                return { id };
            const { employee_id } = body, restBody = __rest(body, ["employee_id"]);
            // check xem đã cập nhật hay chưa
            let dataUpdate = Object.assign({}, restBody);
            // if (!isAdmin) {
            //     Object.keys(dataUpdate).forEach((key) => {
            //         const keyAsGateLogKey = key as keyof typeof gateLog;
            //         if (
            //             gateLog[keyAsGateLogKey] !== null &&
            //             gateLog[keyAsGateLogKey] !== undefined &&
            //             gateLog[keyAsGateLogKey] !== ''
            //         ) {
            //             delete dataUpdate[key as keyof typeof dataUpdate];
            //         }
            //     });
            // }
            let employeeId = null;
            if (gateLog.employee_id === null) {
                const userInfo = yield this.userRepo.findFirst({ id: userId });
                if (userInfo) {
                    employeeId = userInfo.employee_id;
                }
            }
            yield this.repo.update({ id }, Object.assign(Object.assign({}, dataUpdate), (employeeId && { employee_id: employeeId })));
            return { id };
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateStatusApprove(id);
            yield this.repo.update({ id }, body);
            return { id };
        });
    }
    connect(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { children_id, parent_id } = body;
            const children = yield this.findOne({ id: children_id });
            const parent = yield this.findOne({ id: parent_id });
            yield this.repo.updateMany([
                { id: children_id, idx: children_id, entry_time: parent === null || parent === void 0 ? void 0 : parent.entry_time },
                { id: parent_id, idx: children_id },
            ]);
            return { id: children_id || 0 };
        });
    }
}
exports.GateLogService = GateLogService;
