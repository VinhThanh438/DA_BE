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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const user_repo_1 = require("../repositories/user.repo");
const base_service_1 = require("./master/base.service");
const logger_1 = __importDefault(require("../logger"));
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
const employee_repo_1 = require("../repositories/employee.repo");
const user_role_repo_1 = require("../repositories/user-role.repo");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const role_repo_1 = require("../repositories/role.repo");
const organization_repo_1 = require("../repositories/organization.repo");
const prisma_select_1 = require("../repositories/prisma/prisma.select");
class UserService extends base_service_1.BaseService {
    constructor() {
        super(new user_repo_1.UserRepo());
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.userRoleRepo = new user_role_repo_1.UserRoleRepo();
        this.roleRepo = new role_repo_1.RoleRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new UserService();
        }
        return this.instance;
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.findOne({ id }, true);
            if (!data) {
                throw new api_error_1.APIError({
                    message: 'common.not-found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                });
            }
            return data;
        });
    }
    createUser(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = 0;
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    yield this.isExist({ username: body.username }, false, tx);
                    yield this.validateForeignKeys(body, {
                        employee_id: this.employeeRepo,
                    });
                    const { user_roles, password } = body, userData = __rest(body, ["user_roles", "password"]);
                    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                    id = yield this.repo.create(Object.assign(Object.assign({}, userData), { password: hashedPassword }), tx);
                    if (body.employee_id) {
                        eventbus_1.default.emit(event_constant_1.EVENT_USER_CREATED_OR_DELETED, {
                            employeeId: body.employee_id,
                            status: true,
                        });
                    }
                    // handle user roles
                    if (user_roles && user_roles.length > 0) {
                        yield this.validateForeignKeys(user_roles, {
                            role_id: this.roleRepo,
                            organization_id: this.organizationRepo,
                        }, tx);
                        const userRolesToCreate = user_roles.map((role) => ({
                            user_id: id,
                            role_id: role.role_id,
                            organization_id: role.organization_id,
                        }));
                        yield this.userRoleRepo.createMany(userRolesToCreate, tx);
                    }
                }));
                return { id };
            }
            catch (error) {
                throw error;
            }
        });
    }
    seedAdmin(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.repo.create(body);
            return { id };
        });
    }
    updateLoginStatus(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = yield this.repo.update({ id: body.id }, {
                is_first_loggin: body.status,
                device_uid: [(_a = body.device) !== null && _a !== void 0 ? _a : ''],
            });
            return { id };
        });
    }
    findUser(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, isDefaultSelect = false) {
            try {
                const result = yield this.repo.findOne(data, isDefaultSelect);
                return result;
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.findUser: `, error);
                throw error;
            }
        });
    }
    updateUser(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userExists = yield this.findById(id);
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    if (body.username && body.username !== userExists.username) {
                        yield this.isExist({ username: body.username }, false, tx);
                    }
                    if (body.employee_id && body.employee_id !== userExists.employee_id) {
                        yield this.validateForeignKeys(body, {
                            employee_id: this.employeeRepo,
                        });
                    }
                    const { user_roles, password } = body, userData = __rest(body, ["user_roles", "password"]);
                    let updateData = Object.assign({}, userData);
                    if (password) {
                        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                        updateData.password = hashedPassword;
                    }
                    yield this.repo.update({ id }, updateData, tx);
                    if (user_roles) {
                        yield this.userRoleRepo.deleteMany({ user_id: id }, tx);
                        if (user_roles.length > 0) {
                            yield this.validateForeignKeys(user_roles, {
                                role_id: this.roleRepo,
                                organization_id: this.organizationRepo,
                            }, tx);
                            const userRolesToCreate = user_roles.map((role) => ({
                                user_id: id,
                                role_id: role.role_id,
                                organization_id: role.organization_id,
                            }));
                            yield this.userRoleRepo.createMany(userRolesToCreate, tx);
                        }
                    }
                }));
                return { id };
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.repo.findOne({ id }, true);
            if (!user) {
                throw new api_error_1.APIError({
                    message: 'common.not-found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                });
            }
            if (user.employee_id) {
                eventbus_1.default.emit(event_constant_1.EVENT_USER_CREATED_OR_DELETED, {
                    employeeId: user.employee_id,
                    status: false,
                });
            }
            const deletedId = yield this.repo.delete({ id });
            return { id: deletedId };
        });
    }
    getEmployeeByUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.users.findFirst({
                where: { id },
                select: {
                    id: true,
                    employee: { select: prisma_select_1.EmployeeSelection },
                    organization: { select: prisma_select_1.OrganizationSelection },
                },
            });
            return (data === null || data === void 0 ? void 0 : data.employee) || null;
        });
    }
}
exports.UserService = UserService;
