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
exports.RoleService = void 0;
const base_service_1 = require("./base.service");
const role_interface_1 = require("../../interfaces/role.interface");
const logger_1 = __importDefault(require("../../logger"));
const role_repo_1 = require("../../repositories/role.repo");
class RoleService extends base_service_1.BaseService {
    constructor() {
        super(new role_repo_1.RoleRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RoleService();
        }
        return this.instance;
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.repo.findMany({}, true);
            return data;
        });
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            // default permissions
            const permissions = {};
            role_interface_1.ROLE_MODULES.forEach((m) => {
                permissions[m] = [];
            });
            const id = yield this.repo.create({ name: body.name, permissions });
            return { id };
        });
    }
    updatePermission(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repo.update({ id }, {
                permissions: body.permissions,
            });
            return id;
        });
    }
    hasPermission(role, module, action) {
        try {
            const permissions = role.permissions;
            if (!permissions || !permissions[module]) {
                return false;
            }
            return permissions[module].includes(action);
        }
        catch (error) {
            logger_1.default.error('Error checking permissions:', error);
            return false;
        }
    }
}
exports.RoleService = RoleService;
