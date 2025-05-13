import logger from '@common/logger';
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

    public async exportExcelPurchaseOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body.data;
            const fileName = 'purchase_order.xlsx';
            await this.excelService.exportExcelPurchaseOrder(data, fileName);
            res.download(fileName);
        } catch (error) {
            logger.error(`${this.constructor.name}.exportExcelPurchaseOrder: `, error);
            next(error);
        }
    }

    public async exportExcelPurchaseContract(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body.data;
            const fileName = 'purchase_contract.xlsx';
            await this.excelService.exportExcelPurchaseContract(data, fileName);
            res.download(fileName);
        } catch (error) {
            logger.error(`${this.constructor.name}.exportExcelPurchaseContract: `, error);
            next(error);
        }
    }

    public async exportExcelImportWarehouse(req: Request, res: Response, next: NextFunction) {
        try {
            logger.info('export excel import warehouse');
            const inventoryId = Number(req.params.id);
            const fileResult = await this.excelService.exportExcelImportWarehouse(inventoryId);
            res.download(fileResult);
        } catch (error) {
            logger.error(`${this.constructor.name}.exportExcelImportWarehouse: `, error);
            next(error);
        }
    }

    public async exportExcelSalesCommission(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body.data;
            const fileName = 'export_warehouse.xlsx';
            await this.excelService.exportExcelSalesCommission(data, fileName);
            res.download(fileName);
        } catch (error) {
            logger.error(`${this.constructor.name}.exportExcelExportWarehouse: `, error);
            next(error);
        }
    }

    public async exportExcelPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body.data;
            const fileName = 'export_warehouse.xlsx';
            await this.excelService.exportExcelPayment(data, fileName);
            res.download(fileName);
        } catch (error) {
            logger.error(`${this.constructor.name}.exportExcelExportWarehouse: `, error);
            next(error);
        }
    }
}
