import { UserController } from '@api/controllers/user.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { createUser, updateUser } from '@api/validation/user.validator';
import express from 'express';
const router = express.Router();

router.get('/', UserController.getAll);

router.get('/:id', UserController.getById);

router.post('/', validateRequest(createUser), UserController.create);

router.put('/:id', validateRequest(updateUser), UserController.update);

router.delete('/:id', UserController.delete);

export default router;
