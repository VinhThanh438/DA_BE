import { OrderController } from '@api/controllers/order.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { approve } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = OrderController.getInstance();

router.put('/approve/:id', validateRequest(approve), controller.approveShippingPlan.bind(controller));

export default router;
