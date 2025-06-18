import { InterestLogController } from '@api/controllers/interest-log.controller';
import { LoanController } from '@api/controllers/loan.controller';
import { SpatialClassificationMiddleware } from '@api/middlewares/spatial-classification.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { zodValidateQuery } from '@api/middlewares/zodValidate.middleware';
import { approve, queryById } from '@api/validation/common.validator';
import { getInterestLogs } from '@api/validation/interest-log.validator';
import { create, queryFilter, update } from '@api/validation/loan.validator';
import express from 'express';

const router = express.Router();
const controller = LoanController.getInstance();
const interestLogController = InterestLogController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get(
    '/interest-log',
    zodValidateQuery(getInterestLogs),
    SpatialClassificationMiddleware.assignInfoToQuery,
    interestLogController.paginate.bind(interestLogController),
);

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post(
    '/',
    validateRequest(create),
    SpatialClassificationMiddleware.assignInfoToRequest,
    controller.create.bind(controller),
);

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
