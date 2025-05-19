import { RepresentativeController } from '@api/controllers/representative.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById, queryFilter } from '@api/validation/common.validator';
import { queryDebtFilter } from '@api/validation/representative.validator';
import express from 'express';

const router = express.Router();
const controller = RepresentativeController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/debt', validateRequest(queryDebtFilter), controller.getDebt.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

export default router;
