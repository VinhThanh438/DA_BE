import { InvoiceController } from '@api/controllers/invoice.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById, queryFilter } from '@api/validation/common.validator';
import { create, update, updateEntity } from '@api/validation/invoice.validator';
import express from 'express';

const router = express.Router();
const controller = InvoiceController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/update/:id', validateRequest(update), controller.update.bind(controller));

router.put('/:id', validateRequest(updateEntity), controller.updateChildEntity.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
