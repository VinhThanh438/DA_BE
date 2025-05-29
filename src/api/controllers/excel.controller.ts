import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey, StatusCode } from '@common/errors';
import logger from '@common/logger';
import { AuthService } from '@common/services/auth.service';
import { ExcelService } from '@common/services/excel.service';
import { Response, Request, NextFunction } from 'express';

export class ExcelController {
    private static instance: ExcelController;
    private excelService: ExcelService;

    private constructor() {
        this.excelService = ExcelService.getInstance();
    }

    public static getInstance(): ExcelController {
        if (!this.instance) {
            this.instance = new ExcelController();
        }
        return this.instance;
    }

    public async exportExcel(req: Request, res: Response, next: NextFunction) {
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

            switch (type) {
                case 'purchaseOrder': // don dat hang // pdf
                    path = await this.excelService.exportExcelPurchaseOrder(req.query);
                    break;
                case 'salesOrder': // don ban hang // bo qua
                    path = await this.excelService.exportExcelPurchaseOrder(id);
                    break;
                case 'purchaseDebtComparison': // doi chieu cong no mua // pdf
                    path = await this.excelService.exportExcelDebtComparison(req.query, userId);
                    break;
                case 'purchaseDebtReport': // bao cao cong no mua // bo qua
                    path = await this.excelService.exportExcelPayment(req.query);
                    break;
                case 'purchaseDebtCommissionReport': // bao cao cong no hoa hong cong // bo qua
                    path = await this.excelService.exportExcelSalesCommission(req.query);
                    break;
                case 'inventoryReceipt': // phieu nhap kho // pdf
                    path = await this.excelService.exportExcelImportWarehouse(req.query, userId);
                    break;
                case 'purchaseContract': // hop dong mua hang / chờ a Công gửi
                    path = await this.excelService.exportExcelPurchaseContract(id);
                    break;
                case 'bankTransaction': // giao dich ngan hang // tiền ngân hàng
                    // path = await this.excelService.exportExcelTransaction(req.query);
                    path = await this.excelService.exportExcelTransactionBank(req.query);
                    break;
                case 'Quotation': // bao gia // bỏ qua
                    console.log(req.query);
                    path = await this.excelService.exportExcelQuotation(req.query);
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
