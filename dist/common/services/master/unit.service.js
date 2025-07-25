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
exports.UnitService = void 0;
const api_error_1 = require("../../error/api.error");
const errors_1 = require("../../errors");
const unit_repo_1 = require("../../repositories/unit.repo");
class UnitService {
    constructor() {
        this.unitRepo = new unit_repo_1.UnitRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new UnitService();
        }
        return this.instance;
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            // const isExist = await this.unitRepo.isExist({ name: body.name });
            // if (isExist) {
            //     throw new APIError({
            //         message: 'common.existed',
            //         status: StatusCode.BAD_REQUEST,
            //         errors: [`name.${ErrorKey.EXISTED}`],
            //     });
            // }
            const output = yield this.unitRepo.create(body);
            return { id: output };
        });
    }
    getAll(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield this.unitRepo.paginate(body);
            return output;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExist = yield this.unitRepo.isExist({ id });
            if (!isExist) {
                throw new api_error_1.APIError({
                    message: 'common.not_found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            const output = yield this.unitRepo.delete({ id: id });
            return { id: output };
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            // const isExist = await this.unitRepo.isExist({ id });
            // if (!isExist) {
            //     throw new APIError({
            //         message: 'common.not_found',
            //         status: StatusCode.BAD_REQUEST,
            //         errors: [`id.${ErrorKey.NOT_FOUND}`],
            //     });
            // }
            const output = yield this.unitRepo.update({ id: id }, body);
            return { id: output };
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.unitRepo.findOne({ id: id });
            if (!data) {
                throw new api_error_1.APIError({
                    message: 'common.not_found',
                    status: errors_1.StatusCode.BAD_REQUEST,
                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            return data;
        });
    }
}
exports.UnitService = UnitService;
