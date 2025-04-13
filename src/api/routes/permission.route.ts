import { PermissionController } from '@api/controllers/permission.controller';
import express from 'express';
const router = express.Router();

router.get('/', PermissionController.getAll);

router.get('/:id', PermissionController.getById);

router.post('/', PermissionController.create);

router.put('/', PermissionController.update);

router.delete('/', PermissionController.delete);

export default router;
