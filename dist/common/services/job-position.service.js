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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPositionService = void 0;
const base_service_1 = require("./master/base.service");
const job_position_repo_1 = require("../repositories/job-position.repo");
const position_repo_1 = require("../repositories/position.repo");
const organization_repo_1 = require("../repositories/organization.repo");
class JobPositionService extends base_service_1.BaseService {
    constructor() {
        super(new job_position_repo_1.JobPositionRepo());
        this.positionRepo = new position_repo_1.PositionRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new JobPositionService();
        }
        return this.instance;
    }
    create(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { position_id, organization_id } = request;
            yield this.validateForeignKeys(request, {
                position_id: this.positionRepo,
                organization_id: this.organizationRepo,
            });
            if (position_id) {
                request.position = { connect: { id: position_id } };
                delete request.position_id;
            }
            if (organization_id) {
                request.organization = { connect: { id: organization_id } };
                delete request.organization_id;
            }
            const id = yield this.repo.create(request);
            return { id };
        });
    }
    update(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateForeignKeys(request, {
                position_id: this.positionRepo,
                organization_id: this.organizationRepo,
            });
            const updatedId = yield this.repo.update({ id }, request);
            return { id: updatedId };
        });
    }
}
exports.JobPositionService = JobPositionService;
