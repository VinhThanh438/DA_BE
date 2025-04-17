import express from 'express';
import { logIn } from '../validation/base.validator';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { BankController } from '@api/controllers/bank.controller';
import { createBank, updateBank } from '@api/validation/bank.validator';
const router = express.Router();

router.post('/', validateRequest(createBank), BankController.create);

router.put('/:id', validateRequest(updateBank), BankController.update);

router.delete('/:id', BankController.delete);

router.get('/', BankController.getAll);

export default router;
