import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { logIn } from '../validation/auth.validator';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { AuthMiddleware } from '@api/middlewares/auth.middleware';
const router = express.Router();

router.post('/login', validateRequest(logIn), AuthController.login);

router.use(AuthMiddleware.authenticate);

router.get('/info', AuthController.getInfo);

router.post('/logout', AuthController.logout);

export default router;
