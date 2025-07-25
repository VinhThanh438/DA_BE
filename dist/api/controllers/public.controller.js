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
exports.PublicController = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const quotation_service_1 = require("../../common/services/quotation.service");
class PublicController {
    static createSupplierQuotation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                let result = yield PublicController.quotationService.createSupplierQuotation(body);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error('PublicController.create: ', error);
                next(error);
            }
        });
    }
    static uploadFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.file;
                res.sendJson(data);
            }
            catch (error) {
                logger_1.default.error('PublicController.uploadFile', error);
                next(error);
            }
        });
    }
}
exports.PublicController = PublicController;
PublicController.quotationService = quotation_service_1.QuotationService.getInstance();
