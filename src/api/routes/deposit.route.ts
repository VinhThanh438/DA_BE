import { DepositController } from '@api/controllers/deposit.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { zodValidateBody, zodValidateQuery } from '@api/middlewares/zod-validate.middleware';
import { queryById } from '@api/validation/common.validator';
import {
    approveDepositSchema,
    createDepositSchema,
    getPaginatedDepositsSchema,
    settlementDepositSchema,
    updateDepositSchema,
} from '@api/validation/deposit.validator';
import express from 'express';

const router = express.Router();
const controller = DepositController.getInstance();

router.get('/', zodValidateQuery(getPaginatedDepositsSchema), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    zodValidateBody(createDepositSchema),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put(
    '/:id',
    zodValidateBody(updateDepositSchema),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.update.bind(controller),
);

router.put(
    '/approve/:id',
    zodValidateBody(approveDepositSchema),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.approve.bind(controller),
);

router.put(
    '/settlement/:id',
    zodValidateBody(settlementDepositSchema),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.settlement.bind(controller),
);

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
