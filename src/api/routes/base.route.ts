import express from 'express';
import { logIn } from '../validation/base.validator';
import { validateRequest } from '@api/middlewares/validate.middleware';
const router = express.Router();

router.get('/', validateRequest(logIn));

router.get('/:id');

router.post('/');

router.put('/');

router.delete('/');

export default router;
