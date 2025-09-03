import { Router } from 'express';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { catchAsync } from '../middleware/errorHandler';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// Apply strict rate limiting to auth routes
router.use(strictRateLimiter);

// Auth routes
router.post('/login', catchAsync(authController.login.bind(authController)));
router.post('/register', catchAsync(authController.register.bind(authController)));
router.post('/refresh', catchAsync(authController.refreshToken.bind(authController)));
router.post('/logout', catchAsync(authController.logout.bind(authController)));

export { router as authRoutes };