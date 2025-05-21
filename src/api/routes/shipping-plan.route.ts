import { OrderController } from '@api/controllers/order.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { approveShippingPlan } from '@api/validation/order.validator';
import express from 'express';

const router = express.Router();
const controller = OrderController.getInstance();

router.put('/approve/:id', validateRequest(approveShippingPlan), controller.approveShippingPlan.bind(controller));

export default router;
