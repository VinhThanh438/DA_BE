import { InventoryController } from '@api/controllers/inventory.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { createInventory, updateInventory } from '@api/validation/inventory.validator';
import express from 'express';

const router = express.Router();
const controller = InventoryController.getInstance();
router.get('/', controller.getAll.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(createInventory), controller.create.bind(controller));

router.put('/:id', validateRequest(updateInventory), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
