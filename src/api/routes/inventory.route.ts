import { InventoryController } from '@api/controllers/inventory.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { approve, queryById, queryFilter } from '@api/validation/common.validator';
import {
    create,
    queryFilter as inventoryQueryFilter,
    report,
    update,
    updateAdjustQuantity,
    updateRealQuantity,
} from '@api/validation/inventory.validator';
import express from 'express';

const router = express.Router();
const controller = InventoryController.getInstance();

router.get('/', validateRequest(inventoryQueryFilter), controller.paginate.bind(controller));

router.get('/report', validateRequest(report), controller.getInventoryReport.bind(controller));

router.get('/ledger', validateRequest(queryFilter), controller.getInventoryReportDetail.bind(controller));

router.get('/import-detail', validateRequest(queryFilter), controller.getInventoryImportDetail.bind(controller));

router.get('/different', validateRequest(inventoryQueryFilter), controller.different.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));
router.put('/real-quantity/:id', validateRequest(updateRealQuantity), controller.updateRealQuantity.bind(controller));
router.put(
    '/adjust-quantity/:id',
    validateRequest(updateAdjustQuantity),
    controller.updateAdjustQuantity.bind(controller),
);

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
