import express, { Request, Response } from 'express';
import { settingsService } from '../services/settingsService';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all settings
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const settings = await settingsService.getAllSettings();
  
  res.json({
    success: true,
    data: settings,
    message: 'Settings retrieved successfully'
  });
}));

// Get system settings
router.get('/system', catchAsync(async (req: Request, res: Response) => {
  const settings = await settingsService.getSystemSettings();
  
  res.json({
    success: true,
    data: settings,
    message: 'System settings retrieved successfully'
  });
}));

// Update system settings
router.put('/system', catchAsync(async (req: Request, res: Response) => {
  const updates = req.body;
  const updatedSettings = await settingsService.updateSystemSettings(updates);
  
  res.json({
    success: true,
    data: updatedSettings,
    message: 'System settings updated successfully'
  });
}));

// Get notification settings
router.get('/notifications', catchAsync(async (req: Request, res: Response) => {
  const settings = await settingsService.getNotificationSettings();
  
  res.json({
    success: true,
    data: settings,
    message: 'Notification settings retrieved successfully'
  });
}));

// Update notification settings
router.put('/notifications', catchAsync(async (req: Request, res: Response) => {
  const updates = req.body;
  const updatedSettings = await settingsService.updateNotificationSettings(updates);
  
  res.json({
    success: true,
    data: updatedSettings,
    message: 'Notification settings updated successfully'
  });
}));

// Get POS settings
router.get('/pos', catchAsync(async (req: Request, res: Response) => {
  const settings = await settingsService.getPOSSettings();
  
  res.json({
    success: true,
    data: settings,
    message: 'POS settings retrieved successfully'
  });
}));

// Update POS settings
router.put('/pos', catchAsync(async (req: Request, res: Response) => {
  const updates = req.body;
  const updatedSettings = await settingsService.updatePOSSettings(updates);
  
  res.json({
    success: true,
    data: updatedSettings,
    message: 'POS settings updated successfully'
  });
}));

// Reset settings to default
router.post('/reset', catchAsync(async (req: Request, res: Response) => {
  const settings = await settingsService.resetToDefault();
  
  res.json({
    success: true,
    data: settings,
    message: 'Settings reset to default successfully'
  });
}));

// Export settings
router.get('/export', catchAsync(async (req: Request, res: Response) => {
  const settingsJson = await settingsService.exportSettings();
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="settings.json"');
  res.send(settingsJson);
}));

// Import settings
router.post('/import', catchAsync(async (req: Request, res: Response) => {
  const { settingsJson } = req.body;
  
  if (!settingsJson) {
    return res.status(400).json({
      success: false,
      message: 'Settings JSON is required'
    });
  }
  
  const success = await settingsService.importSettings(settingsJson);
  
  if (success) {
    const settings = await settingsService.getAllSettings();
    res.json({
      success: true,
      data: settings,
      message: 'Settings imported successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Failed to import settings. Invalid JSON format.'
    });
  }
}));

export { router as settingsRoutes };
