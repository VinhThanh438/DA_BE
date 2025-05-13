import express from 'express';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { ClauseController } from '@api/controllers/clause.controller';
import { createClause, updateClause } from '@api/validation/clause.validator';
import { queryById, queryFilter } from '@api/validation/common.validator';

const router = express.Router();
const controller = ClauseController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(createClause), controller.create.bind(controller));

router.put('/:id', validateRequest(updateClause), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
