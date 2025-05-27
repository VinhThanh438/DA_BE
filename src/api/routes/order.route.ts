import { OrderController } from '@api/controllers/order.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { approve, queryById } from '@api/validation/common.validator';
import { create, queryFilter, update } from '@api/validation/order.validator';
import express from 'express';

const router = express.Router();
const controller = OrderController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/progress/:id', controller.getPurchaseProcessing.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));

router.put('/:id', validateRequest(update), controller.updateOrder.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
