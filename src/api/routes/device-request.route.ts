import { DeviceRequestController } from '@api/controllers/device-request.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryFilter } from '@api/validation/common.validator';
import express from 'express';
const router = express.Router();

router.get('/', validateRequest(queryFilter), DeviceRequestController.getAll);

router.put('/:id', DeviceRequestController.approveRequest);

export default router;
