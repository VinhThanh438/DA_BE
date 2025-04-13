import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { logIn } from '../validation/auth.validator';
import { validateRequest } from '@api/middlewares/validate.middleware';
const router = express.Router();

router.post('/login', validateRequest(logIn), AuthController.login);

router.post('/logout', AuthController.logout);

export default router;
