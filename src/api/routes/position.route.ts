import { PositionController } from '@api/controllers/position.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { create, update } from '@api/validation/position.validator';
import express from 'express'

const router = express.Router()
const controller = PositionController.getInstance();

router.get('/', controller.getAll.bind(controller))
router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));
router.post('/', validateRequest(create), controller.create.bind(controller));
router.put('/:id', validateRequest(update), controller.update.bind(controller));
router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router