import express from 'express';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { ClauseController } from '@api/controllers/clause.controller';
import { createClause, updateClause } from '@api/validation/clause.validator';
const router = express.Router();

router.get('/', ClauseController.getAll);

router.get('/:id');

router.post('/', validateRequest(createClause), ClauseController.create);

router.put('/:id', validateRequest(updateClause), ClauseController.update);

router.delete('/:id', ClauseController.delete);

export default router;
