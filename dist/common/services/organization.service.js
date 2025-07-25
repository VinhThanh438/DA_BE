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
exports.OrganizationService = void 0;
const organization_repo_1 = require("../repositories/organization.repo");
const base_service_1 = require("./master/base.service");
const app_constant_1 = require("../../config/app.constant");
const organization_interface_1 = require("../interfaces/organization.interface");
const employee_repo_1 = require("../repositories/employee.repo");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
class OrganizationService extends base_service_1.BaseService {
    constructor() {
        super(new organization_repo_1.OrganizationRepo());
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new OrganizationService();
        }
        return this.instance;
    }
    /**
     * Generates a hierarchical representation of the organization structure
     * starting from the headquarter.
     * @param orgId The ID of the starting organization (default: headquarter)
     * @returns Hierarchical structure as an object
     */
    getHierarchyModel(orgId) {
        return __awaiter(this, void 0, void 0, function* () {
            const organization = (yield this.repo.findOne(orgId
                ? { id: orgId }
                : { type: app_constant_1.OrganizationType.HEAD_QUARTER }, true));
            if (!organization)
                return null;
            const result = {
                id: organization.id,
                type: organization.type,
                name: organization.name || '',
                logo: organization.logo || '',
                code: organization.code || '',
                industry: organization.industry || '',
                address: organization.address || '',
                phone: organization.phone || '',
                hotline: organization.hotline || '',
                email: organization.email || '',
                website: organization.website || '',
                tax_code: organization.tax_code || '',
                leader: organization.leader || null,
                children: [],
            };
            const subOrgs = yield this.repo.findMany({ parent_id: organization.id }, true);
            if (!subOrgs || !Array.isArray(subOrgs))
                return result;
            for (const subOrg of subOrgs) {
                const subHierarchy = yield this.getHierarchyModel(subOrg.id);
                if (subHierarchy)
                    result.children.push(subHierarchy);
            }
            return result;
        });
    }
    createOrganization(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.isExist({ code: request.code });
            yield this.validateForeignKeys(request, {
                leader_id: this.employeeRepo,
                parent_id: this.organizationRepo,
            });
            const id = yield this.repo.create(request);
            if ([app_constant_1.OrganizationType.COMPANY, app_constant_1.OrganizationType.HEAD_QUARTER].includes(request.type)) {
                // Cache the organization data if it's a company
                eventbus_1.default.emit(event_constant_1.EVENT_UPDATE_ORGANIZATION_CACHE_DATA, {
                    id,
                    action: organization_interface_1.ActionType.CREATE,
                });
            }
            return { id };
        });
    }
    updateOrganization(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findById(id);
            yield this.isExist({ name: request.name, code: request.code, id }, true);
            yield this.validateForeignKeys(request, {
                leader_id: this.employeeRepo,
                parent_id: this.organizationRepo,
            });
            yield this.repo.update({ id }, request);
            eventbus_1.default.emit(event_constant_1.EVENT_UPDATE_ORGANIZATION_CACHE_DATA, { id, action: organization_interface_1.ActionType.UPDATE });
            return { id };
        });
    }
    deleteOrganization(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findOne({ id });
            yield this.repo.delete({ id });
            eventbus_1.default.emit(event_constant_1.EVENT_UPDATE_ORGANIZATION_CACHE_DATA, { id, action: organization_interface_1.ActionType.DELETE });
            return { id };
        });
    }
}
exports.OrganizationService = OrganizationService;
