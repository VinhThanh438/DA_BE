import { RepresentativeController } from '@api/controllers/representative.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById, queryFilter } from '@api/validation/common.validator';
import express from 'express'

const router = express.Router()
const controller = RepresentativeController.getInstance();

router.get('/', validateRequest(queryFilter), controller.getAll.bind(controller))

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

export default router