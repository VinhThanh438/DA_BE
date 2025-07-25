import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey } from '@common/errors';
import logger from '@common/logger';
import { FileService } from '@common/services/file.service';
import { ExportFileType } from '@config/app.constant';
import { Response, Request, NextFunction } from 'express';

export class FileController {
    private static instance: FileController;
    private fileService: FileService;

    private constructor() {
        this.fileService = FileService.getInstance();
    }

    public static getInstance(): FileController {
        if (!this.instance) {
            this.instance = new FileController();
        }
        return this.instance;
    }

    public async export(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.query.id);
            const type = req.query.type;
            const partnerId = req.query.partnerId;
            const startAt = req.query.startAt;
            const endAt = req.query.endAt;
            const userId = req.user.id as number;

            if (!type) {
                throw new APIError({
                    message: `type.${ErrorKey.NOT_FOUND}`,
                    status: ErrorCode.BAD_REQUEST,
                });
            }
            let path = '';

            switch (type as ExportFileType) {
                case ExportFileType.PURCHASE_ORDER: // don dat hang // pdf
                    path = await this.fileService.exportExcelPurchaseOrder(req.query);
                    break;
                case ExportFileType.SALE_ORDER: // don ban hang // bo qua
                    path = await this.fileService.exportExcelPurchaseOrder(id);
                    break;
                case ExportFileType.PURCHASE_DEBT_COMPARISON: // doi chieu cong no mua // pdf
                    path = await this.fileService.exportExcelDebtComparison(req.query, userId);
                    break;
                case ExportFileType.PURCHASE_DEBT_REPORT: // bao cao cong no mua // bo qua
                    path = await this.fileService.exportExcelPayment(req.query);
                    break;
                case ExportFileType.PURCHASE_DEBT_COMMISSION_REPORT: // bao cao cong no hoa hong cong // bo qua
                    path = await this.fileService.exportExcelSalesCommission(req.query);
                    break;
                case ExportFileType.INVENTORY_IMPORT: // phieu nhap kho // pdf
                    path = await this.fileService.exportExcelImportWarehouse(req.query, userId);
                    break;
                case ExportFileType.INVENTORY_EXPORT: // phieu xuat kho // pdf
                    path = await this.fileService.exportExcelExportWarehouse(req.query, userId);
                    break;
                case ExportFileType.PURCHASE_CONTRACT: // hop dong mua hang / chờ a Công gửi
                    path = await this.fileService.exportExcelPurchaseContract(id);
                    break;
                case ExportFileType.BANK_TRANSACTION: // giao dich ngan hang // tiền ngân hàng // pdf
                    // path = await this.fileService.exportExcelTransaction(req.query);
                    path = await this.fileService.exportExcelTransactionBank(req.query);
                    break;
                case ExportFileType.QUOTATION: // bao gia
                    path = await this.fileService.exportExcelQuotation(req.query);
                    break;
                case ExportFileType.INVENTORY_FINISHED: // phieu nhap thanh pham
                    path = await this.fileService.exportExcelImportFinished(req.query, userId);
                    break;
                case ExportFileType.PRODUCTION_1: // lenh san xuat 1
                    path = await this.fileService.production1(req.query, userId);
                    break;
                case ExportFileType.PRODUCTION_2: // lenh san xuat 2
                    path = await this.fileService.production2(req.query, userId);
                    break;
                case ExportFileType.PRODUCTION_3: // lenh san xuat 3
                    path = await this.fileService.production3(req.query, userId);
                    break;
                case ExportFileType.EXPORT_MATERIAL: // phieu xuat vat tu
                    path = await this.fileService.exportExcelExportMaterial(req.query, userId);
                    break;
                default:
                    throw new APIError({
                        message: `type.${ErrorKey.INVALID}`,
                        status: ErrorCode.BAD_REQUEST,
                    });
            }
            return res.sendJson(path);
        } catch (error) {
            logger.error(`${this.constructor.name}.exportExcelPurchaseOrder: `, error);
            next(error);
        }
    }
}
