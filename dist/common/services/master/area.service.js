"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreasService = void 0;
const area_repo_1 = require("../../repositories/area.repo");
const base_service_1 = require("./base.service");
class AreasService extends base_service_1.BaseService {
    constructor() {
        super(new area_repo_1.AreaRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new AreasService();
        }
        return this.instance;
    }
    paginate(query) {
        delete query.organizationId;
        delete query.OR;
        return this.repo.paginate(query);
    }
}
exports.AreasService = AreasService;
