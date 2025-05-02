import { WarehouseController } from '@api/controllers/warehouse.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById, queryFilter } from '@api/validation/common.validator';
import { createAndUpdate } from '@api/validation/warehouse.validator';
import express from 'express';

const router = express.Router();
const controller = WarehouseController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(createAndUpdate), controller.create.bind(controller));

router.put('/:id', validateRequest(createAndUpdate), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
