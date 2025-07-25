import { NotificationController } from '@api/controllers/notification.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryFilter } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = NotificationController.getInstance();

// router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

export default router;
