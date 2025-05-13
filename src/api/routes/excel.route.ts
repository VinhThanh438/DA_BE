import { ExcelController } from '@api/controllers/excel.controller';
import express from 'express';

const router = express.Router();
const controller = ExcelController.getInstance();

// excel mua hang
router.get('/purchase-order', controller.exportExcelPurchaseOrder.bind(controller));
router.get('/purchase-contract', controller.exportExcelPurchaseContract.bind(controller));
router.get('/import-warehouse/:id', controller.exportExcelImportWarehouse.bind(controller));
router.get('/sales-commission', controller.exportExcelSalesCommission.bind(controller));
router.get('/payment', controller.exportExcelPayment.bind(controller));

// excel ban hang

// excel cham cong

export default router;
