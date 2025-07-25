import { ProductHistoryController } from '@api/controllers/product-history.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryFilter } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = ProductHistoryController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

export default router;
