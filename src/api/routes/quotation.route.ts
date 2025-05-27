import { QuotationController } from '@api/controllers/quotation.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { approve, create, queryFilter, updateEntity } from '@api/validation/quotation.validator';
import express from 'express';

const router = express.Router();
const controller = QuotationController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(updateEntity), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
