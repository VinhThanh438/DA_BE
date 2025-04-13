import { PermissionGroupController } from '@api/controllers/permission-group.controller';
import express from 'express';
const router = express.Router();

router.get('/', PermissionGroupController.getAll);

router.get('/:id', PermissionGroupController.getById);

router.post('/', PermissionGroupController.create);

router.put('/', PermissionGroupController.update);

router.delete('/', PermissionGroupController.delete);

export default router;
