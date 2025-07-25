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
exports.ProductionStepService = void 0;
const production_step_repo_1 = require("../../repositories/production-step.repo");
const base_service_1 = require("./base.service");
class ProductionStepService extends base_service_1.BaseService {
    constructor() {
        super(new production_step_repo_1.ProductionStepRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductionStepService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            delete query.organizationId;
            delete query.OR;
            return this.repo.paginate(query);
        });
    }
}
exports.ProductionStepService = ProductionStepService;
