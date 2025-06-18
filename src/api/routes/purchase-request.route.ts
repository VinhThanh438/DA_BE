import { PurchaseRequestController } from '@api/controllers/purchase-request.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { approve, create, update, queryFilter } from '@api/validation/purchase-request.validator';
import express from 'express';

const router = express.Router();
const controller = PurchaseRequestController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

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
