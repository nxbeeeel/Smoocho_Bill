import express, { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { analyticsService } from '../services/analyticsService';
import { customerExperienceService } from '../services/customerExperienceService';
import { operationsService } from '../services/operationsService';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// AI-Powered Inventory Management
router.get('/inventory/predictions', catchAsync(async (req: Request, res: Response) => {
  const predictions = await aiService.predictInventoryNeeds([]);
  res.json({
    success: true,
    data: predictions,
    message: 'AI inventory predictions generated successfully'
  });
}));

router.get('/inventory/reorder-recommendations', catchAsync(async (req: Request, res: Response) => {
  const recommendations = await aiService.generateReorderRecommendations();
  res.json({
    success: true,
    data: recommendations,
    message: 'AI reorder recommendations generated successfully'
  });
}));

// AI Sales Forecasting
router.get('/sales/forecast', catchAsync(async (req: Request, res: Response) => {
  const { timeframe, days } = req.query;
  const forecast = await aiService.forecastSales(
    (timeframe as 'daily' | 'weekly' | 'monthly') || 'weekly',
    parseInt(days as string) || 30
  );
  res.json({
    success: true,
    data: forecast,
    message: 'AI sales forecast generated successfully'
  });
}));

// AI Customer Behavior Analysis
router.get('/customers/behavior/:customerId', catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const behavior = await aiService.analyzeCustomerBehavior([]);
  res.json({
    success: true,
    data: behavior,
    message: 'AI customer behavior analysis completed'
  });
}));

router.get('/customers/churn-prediction/:customerId', catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const churnPrediction = await aiService.predictCustomerChurn(customerId, {});
  res.json({
    success: true,
    data: churnPrediction,
    message: 'AI churn prediction generated successfully'
  });
}));

// AI Dynamic Pricing
router.post('/pricing/optimize', catchAsync(async (req: Request, res: Response) => {
  const { products, marketData } = req.body;
  const optimizedPricing = await aiService.optimizePricing(products, marketData);
  res.json({
    success: true,
    data: Object.fromEntries(optimizedPricing),
    message: 'AI pricing optimization completed successfully'
  });
}));

// AI Menu Optimization
router.post('/menu/optimize', catchAsync(async (req: Request, res: Response) => {
  const { products, customerData } = req.body;
  const optimization = await aiService.optimizeMenu(products, customerData);
  res.json({
    success: true,
    data: optimization,
    message: 'AI menu optimization completed successfully'
  });
}));

// AI Fraud Detection
router.post('/fraud/detect', catchAsync(async (req: Request, res: Response) => {
  const { transaction } = req.body;
  const fraudAnalysis = await aiService.detectFraud(transaction);
  res.json({
    success: true,
    data: fraudAnalysis,
    message: 'AI fraud detection completed successfully'
  });
}));

// AI Seasonal Trend Analysis
router.get('/trends/seasonal', catchAsync(async (req: Request, res: Response) => {
  const trends = await aiService.analyzeSeasonalTrends();
  res.json({
    success: true,
    data: trends,
    message: 'AI seasonal trend analysis completed successfully'
  });
}));

// AI Staffing Recommendations
router.post('/staffing/recommend', catchAsync(async (req: Request, res: Response) => {
  const { hourlyData } = req.body;
  const recommendations = await aiService.recommendStaffing(hourlyData);
  res.json({
    success: true,
    data: recommendations,
    message: 'AI staffing recommendations generated successfully'
  });
}));

// Advanced Analytics Routes
router.get('/analytics/metrics/:timeframe', catchAsync(async (req: Request, res: Response) => {
  const { timeframe } = req.params;
  const metrics = await analyticsService.getBusinessMetrics(
    timeframe as 'daily' | 'weekly' | 'monthly' | 'yearly'
  );
  res.json({
    success: true,
    data: metrics,
    message: 'Business metrics retrieved successfully'
  });
}));

router.get('/analytics/trends', catchAsync(async (req: Request, res: Response) => {
  const { period, granularity } = req.query;
  const trends = await analyticsService.analyzeTrends(
    parseInt(period as string) || 30,
    (granularity as 'hour' | 'day' | 'week' | 'month') || 'day'
  );
  res.json({
    success: true,
    data: trends,
    message: 'Trend analysis completed successfully'
  });
}));

router.get('/analytics/customer-segments', catchAsync(async (req: Request, res: Response) => {
  const segments = await analyticsService.segmentCustomers();
  res.json({
    success: true,
    data: segments,
    message: 'Customer segmentation completed successfully'
  });
}));

router.get('/analytics/real-time', catchAsync(async (req: Request, res: Response) => {
  const realTimeMetrics = await analyticsService.getRealTimeMetrics();
  res.json({
    success: true,
    data: realTimeMetrics,
    message: 'Real-time metrics retrieved successfully'
  });
}));

router.get('/analytics/predictions/:days', catchAsync(async (req: Request, res: Response) => {
  const { days } = req.params;
  const predictions = await analyticsService.predictBusinessOutcomes(parseInt(days));
  res.json({
    success: true,
    data: predictions,
    message: 'Business predictions generated successfully'
  });
}));

router.get('/analytics/market-position', catchAsync(async (req: Request, res: Response) => {
  const marketPosition = await analyticsService.analyzeMarketPosition();
  res.json({
    success: true,
    data: marketPosition,
    message: 'Market position analysis completed successfully'
  });
}));

router.get('/analytics/operational-efficiency', catchAsync(async (req: Request, res: Response) => {
  const efficiency = await analyticsService.analyzeOperationalEfficiency();
  res.json({
    success: true,
    data: efficiency,
    message: 'Operational efficiency analysis completed successfully'
  });
}));

// Customer Experience Routes
router.get('/customers/profile/:customerId', catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const profile = await customerExperienceService.getCustomerProfile(customerId);
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Customer profile not found'
    });
  }
  
  res.json({
    success: true,
    data: profile,
    message: 'Customer profile retrieved successfully'
  });
}));

router.get('/customers/loyalty-tiers', catchAsync(async (req: Request, res: Response) => {
  const tiers = await customerExperienceService.getLoyaltyTiers();
  res.json({
    success: true,
    data: tiers,
    message: 'Loyalty tiers retrieved successfully'
  });
}));

router.get('/customers/recommendations/:customerId', catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const recommendations = await customerExperienceService.getPersonalizedRecommendations(customerId);
  res.json({
    success: true,
    data: recommendations,
    message: 'Personalized recommendations generated successfully'
  });
}));

router.post('/customers/feedback/analyze', catchAsync(async (req: Request, res: Response) => {
  const { feedback } = req.body;
  const analysis = await customerExperienceService.analyzeCustomerFeedback(feedback);
  res.json({
    success: true,
    data: analysis,
    message: 'Customer feedback analysis completed successfully'
  });
}));

router.get('/customers/retention-strategies/:customerId', catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const strategies = await customerExperienceService.generateRetentionStrategies(customerId);
  res.json({
    success: true,
    data: strategies,
    message: 'Retention strategies generated successfully'
  });
}));

router.get('/customers/journey/:customerId', catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const journey = await customerExperienceService.optimizeCustomerJourney(customerId);
  res.json({
    success: true,
    data: journey,
    message: 'Customer journey optimization completed successfully'
  });
}));

router.get('/customers/satisfaction/:timeframe', catchAsync(async (req: Request, res: Response) => {
  const { timeframe } = req.params;
  const satisfaction = await customerExperienceService.measureCustomerSatisfaction(
    timeframe as 'daily' | 'weekly' | 'monthly'
  );
  res.json({
    success: true,
    data: satisfaction,
    message: 'Customer satisfaction measured successfully'
  });
}));

// Operations Routes
router.post('/operations/schedule', catchAsync(async (req: Request, res: Response) => {
  const { date, requirements } = req.body;
  const schedule = await operationsService.generateOptimalSchedule(date, requirements);
  res.json({
    success: true,
    data: schedule,
    message: 'Optimal staff schedule generated successfully'
  });
}));

router.post('/operations/kitchen-optimization', catchAsync(async (req: Request, res: Response) => {
  const { orders } = req.body;
  const optimization = await operationsService.optimizeKitchenWorkflow(orders);
  res.json({
    success: true,
    data: optimization,
    message: 'Kitchen workflow optimization completed successfully'
  });
}));

router.get('/operations/supply-chain', catchAsync(async (req: Request, res: Response) => {
  const supplyChain = await operationsService.manageSupplyChain();
  res.json({
    success: true,
    data: supplyChain,
    message: 'Supply chain management data retrieved successfully'
  });
}));

router.get('/operations/quality-control', catchAsync(async (req: Request, res: Response) => {
  const qualityControl = await operationsService.performQualityControl();
  res.json({
    success: true,
    data: qualityControl,
    message: 'Quality control data retrieved successfully'
  });
}));

router.get('/operations/maintenance', catchAsync(async (req: Request, res: Response) => {
  const maintenance = await operationsService.scheduleMaintenance();
  res.json({
    success: true,
    data: maintenance,
    message: 'Maintenance schedule retrieved successfully'
  });
}));

router.get('/operations/automation', catchAsync(async (req: Request, res: Response) => {
  const automation = await operationsService.automateProcesses();
  res.json({
    success: true,
    data: automation,
    message: 'Process automation analysis completed successfully'
  });
}));

router.get('/operations/performance', catchAsync(async (req: Request, res: Response) => {
  const performance = await operationsService.monitorPerformance();
  res.json({
    success: true,
    data: performance,
    message: 'Performance metrics retrieved successfully'
  });
}));

router.get('/operations/risks', catchAsync(async (req: Request, res: Response) => {
  const risks = await operationsService.assessRisks();
  res.json({
    success: true,
    data: risks,
    message: 'Risk assessment completed successfully'
  });
}));

router.get('/operations/improvement-plan', catchAsync(async (req: Request, res: Response) => {
  const plan = await operationsService.generateImprovementPlan();
  res.json({
    success: true,
    data: plan,
    message: 'Improvement plan generated successfully'
  });
}));

export { router as aiRoutes };
