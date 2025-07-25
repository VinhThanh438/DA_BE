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
exports.FileController = void 0;
const api_error_1 = require("../../common/error/api.error");
const errors_1 = require("../../common/errors");
const logger_1 = __importDefault(require("../../common/logger"));
const file_service_1 = require("../../common/services/file.service");
const app_constant_1 = require("../../config/app.constant");
class FileController {
    constructor() {
        this.fileService = file_service_1.FileService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new FileController();
        }
        return this.instance;
    }
    export(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.query.id);
                const type = req.query.type;
                const partnerId = req.query.partnerId;
                const startAt = req.query.startAt;
                const endAt = req.query.endAt;
                const userId = req.user.id;
                if (!type) {
                    throw new api_error_1.APIError({
                        message: `type.${errors_1.ErrorKey.NOT_FOUND}`,
                        status: errors_1.ErrorCode.BAD_REQUEST,
                    });
                }
                let path = '';
                switch (type) {
                    case app_constant_1.ExportFileType.PURCHASE_ORDER: // don dat hang // pdf
                        path = yield this.fileService.exportExcelPurchaseOrder(req.query);
                        break;
                    case app_constant_1.ExportFileType.SALE_ORDER: // don ban hang // bo qua
                        path = yield this.fileService.exportExcelPurchaseOrder(id);
                        break;
                    case app_constant_1.ExportFileType.PURCHASE_DEBT_COMPARISON: // doi chieu cong no mua // pdf
                        path = yield this.fileService.exportExcelDebtComparison(req.query, userId);
                        break;
                    case app_constant_1.ExportFileType.PURCHASE_DEBT_REPORT: // bao cao cong no mua // bo qua
                        path = yield this.fileService.exportExcelPayment(req.query);
                        break;
                    case app_constant_1.ExportFileType.PURCHASE_DEBT_COMMISSION_REPORT: // bao cao cong no hoa hong cong // bo qua
                        path = yield this.fileService.exportExcelSalesCommission(req.query);
                        break;
                    case app_constant_1.ExportFileType.INVENTORY_IMPORT: // phieu nhap kho // pdf
                        path = yield this.fileService.exportExcelImportWarehouse(req.query, userId);
                        break;
                    case app_constant_1.ExportFileType.INVENTORY_EXPORT: // phieu xuat kho // pdf
                        path = yield this.fileService.exportExcelExportWarehouse(req.query, userId);
                        break;
                    case app_constant_1.ExportFileType.PURCHASE_CONTRACT: // hop dong mua hang / chờ a Công gửi
                        path = yield this.fileService.exportExcelPurchaseContract(id);
                        break;
                    case app_constant_1.ExportFileType.BANK_TRANSACTION: // giao dich ngan hang // tiền ngân hàng // pdf
                        // path = await this.fileService.exportExcelTransaction(req.query);
                        path = yield this.fileService.exportExcelTransactionBank(req.query);
                        break;
                    case app_constant_1.ExportFileType.QUOTATION: // bao gia
                        path = yield this.fileService.exportExcelQuotation(req.query);
                        break;
                    case app_constant_1.ExportFileType.INVENTORY_FINISHED: // phieu nhap thanh pham
                        path = yield this.fileService.exportExcelImportFinished(req.query, userId);
                        break;
                    case app_constant_1.ExportFileType.PRODUCTION_1: // lenh san xuat 1
                        path = yield this.fileService.production1(req.query, userId);
                        break;
                    case app_constant_1.ExportFileType.PRODUCTION_2: // lenh san xuat 2
                        path = yield this.fileService.production2(req.query, userId);
                        break;
                    case app_constant_1.ExportFileType.PRODUCTION_3: // lenh san xuat 3
                        path = yield this.fileService.production3(req.query, userId);
                        break;
                    case app_constant_1.ExportFileType.EXPORT_MATERIAL: // phieu xuat vat tu
                        path = yield this.fileService.exportExcelExportMaterial(req.query, userId);
                        break;
                    default:
                        throw new api_error_1.APIError({
                            message: `type.${errors_1.ErrorKey.INVALID}`,
                            status: errors_1.ErrorCode.BAD_REQUEST,
                        });
                }
                return res.sendJson(path);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.exportExcelPurchaseOrder: `, error);
                next(error);
            }
        });
    }
}
exports.FileController = FileController;
