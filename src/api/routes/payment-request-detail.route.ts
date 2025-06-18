import { PaymentRequestDetailController } from '@api/controllers/payment-request-detail.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryFilter } from '@api/validation/payment-request-detail.validator';
import express from 'express';

const router = express.Router();
const controller = PaymentRequestDetailController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

export default router;
