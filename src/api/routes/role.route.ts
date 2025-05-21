import { RoleController } from '@api/controllers/role.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { updatePermission, create, update } from '@api/validation/role.validator';
import express from 'express';

const router = express.Router();
const controller = RoleController.getInstance();

router.get('/', controller.getAll.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/permission/:id', validateRequest(updatePermission), controller.updatePermission.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
