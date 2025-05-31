import { PaymentController } from '@api/controllers/payment.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { approve, queryById } from '@api/validation/common.validator';
import { create, queryFilter, update } from '@api/validation/payment.validator';
import { queryFilter as baseQueryFilter } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = PaymentController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

// Bao cao tong hop ton quy
router.get('/report', validateRequest(baseQueryFilter), controller.report.bind(controller));

// So quy
router.get('/ledger', validateRequest(queryFilter), controller.ledger.bind(controller));

router.put('/close', validateRequest(baseQueryFilter), controller.close.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
