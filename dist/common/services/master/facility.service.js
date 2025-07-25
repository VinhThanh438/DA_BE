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
exports.FacilityService = void 0;
const facility_repo_1 = require("../../repositories/facility.repo");
const unit_repo_1 = require("../../repositories/unit.repo");
const common_service_1 = require("../common.service");
const base_service_1 = require("./base.service");
const partner_repo_1 = require("../../repositories/partner.repo");
class FacilityService extends base_service_1.BaseService {
    constructor() {
        super(new facility_repo_1.FacilityRepo());
        this.unitRepo = new unit_repo_1.UnitRepo();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new FacilityService();
        }
        return this.instance;
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = yield common_service_1.CommonService.getCode('FACILITY');
            const facilityData = Object.assign(Object.assign({}, body), { code });
            // await this.findAndCheckExist(facilityData, ['name']);
            yield this.validateForeignKeys(facilityData, {
                unit_id: this.unitRepo,
                partner_id: this.partnerRepo,
            });
            const mapData = this.autoMapConnection([facilityData]);
            const id = yield this.repo.create(mapData[0]);
            return { id };
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (body.name) await this.findAndCheckExist(body, ['name'], true);
            if (body.unit_id) {
                yield this.validateForeignKeys(body, {
                    unit_id: this.unitRepo,
                    partner_id: this.partnerRepo,
                });
            }
            const mapData = this.autoMapConnection([body]);
            yield this.repo.update({ id }, mapData[0]);
            return { id };
        });
    }
    createMany(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const mapData = this.autoMapConnection(data);
            yield this.repo.createMany(mapData, tx);
        });
    }
}
exports.FacilityService = FacilityService;
