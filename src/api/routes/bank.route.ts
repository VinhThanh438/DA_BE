import express from 'express';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { BankController } from '@api/controllers/bank.controller';
import { queryById, queryFilter } from '@api/validation/common.validator';
import { create, update } from '@api/validation/bank.validator';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';

const router = express.Router();
const controller = BankController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
