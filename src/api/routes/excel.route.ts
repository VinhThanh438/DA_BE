import { ExcelController } from '@api/controllers/excel.controller';
import express from 'express';

const router = express.Router();
const controller = ExcelController.getInstance();

// excel mua hang
router.get('/', controller.exportExcel.bind(controller));
// router.get('/sales-commission', controller.exportExcelSalesCommission.bind(controller));
// router.get('/payment', controller.exportExcelPayment.bind(controller));
// router.get('/transaction', controller.exportExcelTransaction.bind(controller));
// router.get('/dept-comparison', controller.exportExcelDebtComparison.bind(controller));
// router.get('/quotation', controller.exportExcelQuatation.bind(controller));

// excel ban hang

// excel cham cong

export default router;
