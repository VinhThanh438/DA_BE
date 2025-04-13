import { DeviceRequestController } from '@api/controllers/device-request.controller';
import express from 'express';
const router = express.Router();

router.get('/', DeviceRequestController.getAll);

router.put('/:id', DeviceRequestController.approveRequest);

export default router;
