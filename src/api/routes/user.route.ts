import { UserController } from '@api/controllers/user.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById, queryFilter } from '@api/validation/common.validator';
import { createUser, updateUser } from '@api/validation/user.validator';
import express from 'express';

const router = express.Router();
const controller = UserController.getInstance();

router.get('/', validateRequest(queryFilter), controller.getAll.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(createUser), controller.create.bind(controller));

router.put('/:id', validateRequest(updateUser), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
