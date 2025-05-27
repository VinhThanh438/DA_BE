import { UserController } from '@api/controllers/user.controller';
import { PermissionMiddleware } from '@api/middlewares/permission.middleware';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById, queryFilter } from '@api/validation/common.validator';
import { createUser, updateUser } from '@api/validation/user.validator';
import express from 'express';

const router = express.Router();
const controller = UserController.getInstance();

router.get(
    '/',
    // PermissionMiddleware.hasPermission('warehouse', 'c'),
    validateRequest(queryFilter),
    controller.paginate.bind(controller),
);

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(createUser),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(updateUser), controller.updateUser.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
