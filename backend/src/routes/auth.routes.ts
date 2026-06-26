import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAdminAuth } from '../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.get('/me', requireAdminAuth, authController.me);
