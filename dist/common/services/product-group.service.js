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
exports.ProductGroupService = void 0;
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const product_group_repo_1 = require("../repositories/product-group.repo");
class ProductGroupService {
    constructor() {
        this.productGroupRepo = new product_group_repo_1.ProductGroupRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductGroupService();
        }
        return this.instance;
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            // const isExist = await this.productGroupRepo.isExist({ name: body.name });
            // if (isExist) {
            //     throw new APIError({
            //         message: 'common.existed',
            //         status: ErrorCode.BAD_REQUEST,
            //         errors: [`name.${ErrorKey.EXISTED}`],
            //     });
            // }
            const output = yield this.productGroupRepo.create(body);
            return { id: output };
        });
    }
    getAll(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield this.productGroupRepo.paginate(body);
            return output;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // const isExist = await this.productGroupRepo.isExist({ id: id });
            // if (!isExist) {
            //     throw new APIError({
            //         message: 'common.not_found',
            //         status: ErrorCode.BAD_REQUEST,
            //         errors: [`id.${ErrorKey.NOT_FOUND}`],
            //     });
            // }
            const output = yield this.productGroupRepo.delete({ id: id });
            return { id: output };
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.productGroupRepo.findOne({ id: id });
            if (!data) {
                throw new api_error_1.APIError({
                    message: 'common.not_found',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            return data;
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExist = yield this.productGroupRepo.isExist({ id: id });
            if (!isExist) {
                throw new api_error_1.APIError({
                    message: 'common.not_found',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            const existed = yield this.productGroupRepo.isExist({ name: body.name });
            if (existed) {
                throw new api_error_1.APIError({
                    message: 'common.existed',
                    status: errors_1.ErrorCode.BAD_REQUEST,
                    errors: [`name.${errors_1.ErrorKey.EXISTED}`],
                });
            }
            const output = yield this.productGroupRepo.update({ id: id }, body);
            return { id: output };
        });
    }
}
exports.ProductGroupService = ProductGroupService;
