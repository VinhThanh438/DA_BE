import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { ProductionController } from '@api/controllers/production.controller';
import { productionValidator } from '@api/validation/production.validator';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = ProductionController.getInstance();

router.get('/', validateRequest(productionValidator.queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(productionValidator.create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(productionValidator.update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
