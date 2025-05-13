import { BillOfMaterialController } from '@api/controllers/bill-of-material.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { create, queryFilter, update } from '@api/validation/bill-of-material.validator';
import { queryById } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = BillOfMaterialController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
