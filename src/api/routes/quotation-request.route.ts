import { QuotationRequestController } from '@api/controllers/quotation-request.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { approveQuotationRequest, create, queryFilter, update } from '@api/validation/quotation-request.validator';
import express from 'express';

const router = express.Router();
const controller = QuotationRequestController.getInstance();

router.get('/', validateRequest(queryFilter), controller.getAll.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.put('/approve/:id', validateRequest(approveQuotationRequest), controller.approve.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
