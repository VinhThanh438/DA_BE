import { PaymentRequestController } from '@api/controllers/payment-request.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { approve, create, queryFilter } from '@api/validation/payment-request.validator';
import express from 'express';

const router = express.Router();
const controller = PaymentRequestController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));

// router.put('/:id', validateRequest(approve), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
