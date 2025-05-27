import { TransactionController } from '@api/controllers/transaction.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById, queryFilter } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = TransactionController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

// router.post('/', validateRequest(createUnit), controller.create.bind(controller));

// router.put('/:id', validateRequest(updateUnit), controller.update.bind(controller));

// router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
