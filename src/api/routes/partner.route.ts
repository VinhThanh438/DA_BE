import { PartnerController } from '@api/controllers/partner.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { create, queryDebtFilter, queryFilter } from '@api/validation/partner.validator';
import { update } from '@api/validation/partner.validator';
import express from 'express';

const router = express.Router();
const controller = PartnerController.getInstance();

router.get('/debt', validateRequest(queryDebtFilter), controller.getDebt.bind(controller));

router.get('/commission-debt', validateRequest(queryDebtFilter), controller.getCommissionDebt.bind(controller));

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
