import { FileController } from '@api/controllers/file.controller';
import { RateLimiterMiddleware } from '@api/middlewares/ratelimiter.middleware';
import express from 'express';

const router = express.Router();
const controller = FileController.getInstance();

router.get('/', RateLimiterMiddleware.exportFileLimiter, controller.export.bind(controller));

export default router;
