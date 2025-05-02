import express from 'express';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { BankController } from '@api/controllers/bank.controller';
import { createBank, updateBank } from '@api/validation/bank.validator';
import { queryById, queryFilter } from '@api/validation/common.validator';
const router = express.Router();

router.post('/', validateRequest(createBank), BankController.create);

router.put('/:id', validateRequest(updateBank), BankController.update);

router.delete('/:id', validateRequest(queryById), BankController.delete);

router.get('/', validateRequest(queryFilter), BankController.getAll);

export default router;
