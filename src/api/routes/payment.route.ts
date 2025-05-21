import { PaymentController } from '@api/controllers/payment.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { create, queryFilter, update, approve } from '@api/validation/payment.validator';
import express from 'express';

const router = express.Router();
const controller = PaymentController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
