import express, { Request, Response } from 'express';
import { stockManagementService } from '../services/stockManagementService';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Perform daily stock count
router.post('/counts/daily', catchAsync(async (req: Request, res: Response) => {
  const { counts, countedBy } = req.body;
  
  if (!counts || !Array.isArray(counts) || !countedBy) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request. Requires counts array and countedBy user'
    });
  }

  const result = await stockManagementService.performDailyCount(counts, countedBy);
  
  if (result.success) {
    res.json({
      success: true,
      data: {
        counts: result.counts,
        summary: {
          totalCounted: result.counts.length,
          totalVariance: result.counts.reduce((sum, count) => sum + Math.abs(count.difference), 0),
          itemsWithVariance: result.counts.filter(count => count.difference !== 0).length
        }
      },
      message: 'Daily stock count completed successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      data: {
        counts: result.counts,
        errors: result.errors
      },
      message: 'Daily stock count completed with errors'
    });
  }
}));

// Perform nightly stock count
router.post('/counts/nightly', catchAsync(async (req: Request, res: Response) => {
  const { counts, countedBy } = req.body;
  
  if (!counts || !Array.isArray(counts) || !countedBy) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request. Requires counts array and countedBy user'
    });
  }

  const result = await stockManagementService.performNightlyCount(counts, countedBy);
  
  if (result.success) {
    res.json({
      success: true,
      data: {
        counts: result.counts,
        summary: {
          totalCounted: result.counts.length,
          totalVariance: result.counts.reduce((sum, count) => sum + Math.abs(count.difference), 0),
          itemsWithVariance: result.counts.filter(count => count.difference !== 0).length
        }
      },
      message: 'Nightly stock count completed successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      data: {
        counts: result.counts,
        errors: result.errors
      },
      message: 'Nightly stock count completed with errors'
    });
  }
}));

// Manual stock adjustment
router.post('/adjustments', catchAsync(async (req: Request, res: Response) => {
  const adjustmentData = req.body;
  
  if (!adjustmentData.inventoryItemId || !adjustmentData.quantity || 
      !adjustmentData.reason || !adjustmentData.adjustedBy) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request. Requires inventoryItemId, quantity, reason, and adjustedBy'
    });
  }

  const result = await stockManagementService.adjustStock(adjustmentData);
  
  if (result.success) {
    res.json({
      success: true,
      data: result.adjustment,
      message: 'Stock adjustment completed successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: result.errors.join(', ')
    });
  }
}));

// Get stock counts with filters
router.get('/counts', catchAsync(async (req: Request, res: Response) => {
  const { countType, startDate, endDate, countedBy, limit } = req.query;
  
  const filters: any = {};
  if (countType) filters.countType = countType;
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (countedBy) filters.countedBy = countedBy;
  if (limit) filters.limit = parseInt(limit as string);
  
  const counts = await stockManagementService.getStockCounts(filters);
  
  res.json({
    success: true,
    data: counts,
    message: 'Stock counts retrieved successfully'
  });
}));

// Get stock adjustments with filters
router.get('/adjustments', catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, adjustedBy, adjustmentType, limit } = req.query;
  
  const filters: any = {};
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (adjustedBy) filters.adjustedBy = adjustedBy;
  if (adjustmentType) filters.adjustmentType = adjustmentType;
  if (limit) filters.limit = parseInt(limit as string);
  
  const adjustments = await stockManagementService.getStockAdjustments(filters);
  
  res.json({
    success: true,
    data: adjustments,
    message: 'Stock adjustments retrieved successfully'
  });
}));

// Generate comprehensive stock report
router.get('/report', catchAsync(async (req: Request, res: Response) => {
  const report = await stockManagementService.generateStockReport();
  
  const summary = {
    totalItems: report.length,
    normalItems: report.filter(item => item.status === 'normal').length,
    lowStockItems: report.filter(item => item.status === 'low').length,
    criticalItems: report.filter(item => item.status === 'critical').length,
    overstockItems: report.filter(item => item.status === 'overstock').length,
    totalVariance: report.reduce((sum, item) => sum + Math.abs(item.variance), 0)
  };
  
  res.json({
    success: true,
    data: {
      report,
      summary
    },
    message: 'Stock report generated successfully'
  });
}));

// Get items that need counting
router.get('/items-needing-count', catchAsync(async (req: Request, res: Response) => {
  const { daysThreshold } = req.query;
  const threshold = daysThreshold ? parseInt(daysThreshold as string) : 1;
  
  const itemsNeedingCount = await stockManagementService.getItemsNeedingCount(threshold);
  
  res.json({
    success: true,
    data: itemsNeedingCount,
    message: 'Items needing count retrieved successfully'
  });
}));

// Get daily count summary for a specific date
router.get('/daily-summary/:date', catchAsync(async (req: Request, res: Response) => {
  const { date } = req.params;
  const targetDate = new Date(date);
  
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  const summary = await stockManagementService.getDailyCountSummary(targetDate);
  
  res.json({
    success: true,
    data: summary,
    message: `Daily count summary for ${date} retrieved successfully`
  });
}));

// Get stock count by ID
router.get('/counts/:countId', catchAsync(async (req: Request, res: Response) => {
  const { countId } = req.params;
  
  // This would need to be implemented in the service
  // For now, we'll return a placeholder
  res.status(404).json({
    success: false,
    message: 'Individual count retrieval not yet implemented'
  });
}));

// Get stock adjustment by ID
router.get('/adjustments/:adjustmentId', catchAsync(async (req: Request, res: Response) => {
  const { adjustmentId } = req.params;
  
  // This would need to be implemented in the service
  // For now, we'll return a placeholder
  res.status(404).json({
    success: false,
    message: 'Individual adjustment retrieval not yet implemented'
  });
}));

export { router as stockManagementRoutes };
