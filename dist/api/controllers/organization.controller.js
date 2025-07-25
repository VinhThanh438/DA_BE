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
exports.OrganizationController = void 0;
const base_controller_1 = require("./base.controller");
const organization_service_1 = require("../../common/services/organization.service");
const logger_1 = __importDefault(require("../../common/logger"));
const app_constant_1 = require("../../config/app.constant");
class OrganizationController extends base_controller_1.BaseController {
    constructor() {
        super(organization_service_1.OrganizationService.getInstance());
        this.service = organization_service_1.OrganizationService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new OrganizationController();
        }
        return this.instance;
    }
    getHierarchyModel(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.service.getHierarchyModel();
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getHierarchyModel: `, error);
                next(error);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const result = yield this.service.createOrganization(body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.create: `, error);
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const body = req.body;
                const result = yield this.service.updateOrganization(id, body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.update: `, error);
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const result = yield this.service.deleteOrganization(id);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.delete: `, error);
                next(error);
            }
        });
    }
    paginate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.query, { parentId, organization_id } = _a, query = __rest(_a, ["parentId", "organization_id"]);
                query.parent_id = parentId ? Number(parentId) : {};
                delete query.OR;
                const result = yield this.service.paginate(query);
                result.data = result.data.sort((a, b) => {
                    var _a, _b;
                    const indexA = (_a = app_constant_1.OrganizationTypeIndex.get(a.type)) !== null && _a !== void 0 ? _a : Infinity;
                    const indexB = (_b = app_constant_1.OrganizationTypeIndex.get(b.type)) !== null && _b !== void 0 ? _b : Infinity;
                    return indexA - indexB;
                });
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.paginate: `, error);
                next(error);
            }
        });
    }
}
exports.OrganizationController = OrganizationController;
