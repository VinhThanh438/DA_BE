import { CommonController } from '@api/controllers/common.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { getCode } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();

router.get('/code', validateRequest(getCode), CommonController.getCode);

export default router;
