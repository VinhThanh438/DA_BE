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
exports.PermissionMiddleware = void 0;
const api_error_1 = require("../../common/error/api.error");
const errors_1 = require("../../common/errors");
const database_adapter_1 = require("../../common/infrastructure/database.adapter");
const logger_1 = __importDefault(require("../../common/logger"));
require("dotenv/config");
class PermissionMiddleware {
    /**
     * Check if the user has the required permission for a specific module and action
     * @param module The module to check permissions for
     * @param action The action to check permissions for
     * @returns Express middleware function
     */
    static hasPermission(module, action) {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const db = database_adapter_1.DatabaseAdapter.getInstance().getClient();
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                // Admin bypass check
                const isAdmin = yield this.isAdminUser(db, userId);
                if (isAdmin)
                    return next();
                // parse type
                const targetModule = this.resolveModuleFromType(req, module);
                const organizationId = Number(req.query.organizationId);
                if (!userId || !organizationId) {
                    throw new api_error_1.APIError({
                        message: 'auth.common.session-expired',
                        status: errors_1.StatusCode.REQUEST_UNAUTHORIZED,
                    });
                }
                //
                const userRoles = yield this.getUserRolesInOrganization(db, userId, organizationId);
                // flag xem ít hoặc đầy đủ
                const hasPermission = action === 'r'
                    ? this.hasAnyPermissionForModule(userRoles, targetModule)
                    : this.hasSpecificPermission(userRoles, targetModule, action);
                if (!hasPermission) {
                    logger_1.default.warn(`User ${userId} does not have permission to ${action} in ${targetModule}`);
                    throw new api_error_1.APIError({
                        message: 'auth.forbidden',
                        status: errors_1.StatusCode.REQUEST_FORBIDDEN,
                    });
                }
                return next();
            }
            catch (error) {
                logger_1.default.error('Permission check failed:', error);
                next(error);
            }
        });
    }
    /**
     * Resolve the correct module based on request type and module mappings
     * @private
     */
    static resolveModuleFromType(req, defaultModule) {
        const requestType = req.query.type || req.body.type;
        if (!requestType)
            return defaultModule;
        const modules = {
            warehouse: ['customer', 'payment', 'production'],
            product: ['product', 'purchase_order'],
        };
        for (const [source, target] of Object.entries(modules)) {
            if (defaultModule === source && target.includes(requestType)) {
                return requestType;
            }
        }
        return defaultModule;
    }
    /**
     * Check if a user is an admin
     * @private
     */
    static checkAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const db = database_adapter_1.DatabaseAdapter.getInstance().getClient();
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const isAdmin = yield PermissionMiddleware.isAdminUser(db, userId);
                req.user.isAdmin = isAdmin;
                return next();
            }
            catch (error) {
                logger_1.default.error('Admin check failed:', error);
                next(error);
            }
        });
    }
    static isAdminUser(db, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db.users.findUnique({
                select: { username: true },
                where: { id: Number(userId) },
            });
            if (!user)
                return false;
            return user.username === process.env.ADMIN_USER_NAME;
        });
    }
    /**
     * Get user roles in a specific organization
     * @private
     */
    static getUserRolesInOrganization(db, userId, organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db.userRoles.findMany({
                where: {
                    user_id: userId,
                    organization_id: organizationId,
                },
                include: { role: true },
            });
        });
    }
    /**
     * Check if user has any permission for the specified module
     * @private
     */
    static hasAnyPermissionForModule(userRoles, module) {
        for (const userRole of userRoles) {
            const permissions = userRole.role.permissions;
            if (permissions[module] && Array.isArray(permissions[module]) && permissions[module].length > 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * Check if user has a specific permission
     * @private
     */
    static hasSpecificPermission(userRoles, module, action) {
        for (const userRole of userRoles) {
            const permissions = userRole.role.permissions;
            if (!Array.isArray(permissions[module]) || permissions[module].length === 0) {
                continue;
            }
            if (permissions[module].includes(action)) {
                return true;
            }
        }
        return false;
    }
}
exports.PermissionMiddleware = PermissionMiddleware;
