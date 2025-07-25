import { OrderController } from '@api/controllers/order.controller';
import { ShippingPlanController } from '@api/controllers/shipping-plan.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { approve, queryById } from '@api/validation/common.validator';
import { create, update, queryFilter } from '@api/validation/shipping-plan.validator';
import express from 'express';

const router = express.Router();
const controller = ShippingPlanController.getInstance();
const orderController = OrderController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/approve/:id', validateRequest(approve), orderController.approveShippingPlan.bind(orderController));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
