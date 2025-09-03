import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

// Placeholder routes - will be implemented in Phase 2
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Order routes - Coming in Phase 2',
    timestamp: new Date().toISOString()
  });
});

export { router as orderRoutes };