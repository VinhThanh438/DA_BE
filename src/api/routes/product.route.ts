import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { createProduct, queryFilter, updateProduct } from '@api/validation/product.validator';
import { ProductController } from '@api/controllers/product.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = ProductController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(createProduct),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(updateProduct), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
