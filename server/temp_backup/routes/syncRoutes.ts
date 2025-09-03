import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

// Sync routes for offline operations
router.post('/operations', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Sync operations endpoint - Will be implemented with IndexedDB',
    timestamp: new Date().toISOString()
  });
});

router.get('/status', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      lastSync: new Date().toISOString(),
      pendingOperations: 0,
      serverTime: new Date().toISOString()
    }
  });
});

export { router as syncRoutes };