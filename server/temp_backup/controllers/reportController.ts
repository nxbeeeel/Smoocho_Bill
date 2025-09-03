import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import { ReportFilters } from '../types';

// Async error handler wrapper
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: Function) => {
    fn(req, res, next).catch(next);
  };
};

export const reportController = {
  // Get daily sales report
  getDailySalesReport: catchAsync(async (req: Request, res: Response) => {
    const { date } = req.params;
    const filters: ReportFilters = {
      payment_method: req.query.payment_method as any,
      order_type: req.query.order_type as any,
      cashier_id: req.query.cashier_id as string
    };

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
    }

    try {
      const report = await reportService.generateDailySalesReport(date, filters);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get monthly sales report
  getMonthlySalesReport: catchAsync(async (req: Request, res: Response) => {
    const { month, year } = req.params;
    const filters: ReportFilters = {
      payment_method: req.query.payment_method as any,
      order_type: req.query.order_type as any,
      cashier_id: req.query.cashier_id as string
    };

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year parameters are required'
      });
    }

    try {
      const report = await reportService.generateMonthlySalesReport(
        month, 
        parseInt(year), 
        filters
      );
      
      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get cached report (daily or monthly)
  getCachedReport: catchAsync(async (req: Request, res: Response) => {
    const { type, period } = req.params;
    const filters: ReportFilters = {
      payment_method: req.query.payment_method as any,
      order_type: req.query.order_type as any,
      cashier_id: req.query.cashier_id as string
    };

    if (!type || !period) {
      return res.status(400).json({
        success: false,
        error: 'Type and period parameters are required'
      });
    }

    if (type !== 'daily' && type !== 'monthly') {
      return res.status(400).json({
        success: false,
        error: 'Type must be either daily or monthly'
      });
    }

    try {
      const report = await reportService.getCachedReport(type, period, filters);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Generate and store report
  generateReport: catchAsync(async (req: Request, res: Response) => {
    const { type, period } = req.body;
    const filters: ReportFilters = req.body.filters || {};

    if (!type || !period) {
      return res.status(400).json({
        success: false,
        error: 'Type and period are required'
      });
    }

    if (type !== 'daily' && type !== 'monthly') {
      return res.status(400).json({
        success: false,
        error: 'Type must be either daily or monthly'
      });
    }

    try {
      let report;
      
      if (type === 'daily') {
        report = await reportService.generateDailySalesReport(period, filters);
      } else {
        const [month, year] = period.split('-');
        report = await reportService.generateMonthlySalesReport(
          month, 
          parseInt(year), 
          filters
        );
      }

      // Store the report for future access
      await reportService.storeReport(type, period, report);
      
      res.json({
        success: true,
        data: report,
        message: 'Report generated and stored successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get sales summary for date range
  getSalesSummary: catchAsync(async (req: Request, res: Response) => {
    const { date_from, date_to } = req.query;
    const filters: ReportFilters = {
      date_from: date_from as string,
      date_to: date_to as string,
      payment_method: req.query.payment_method as any,
      order_type: req.query.order_type as any,
      cashier_id: req.query.cashier_id as string
    };

    if (!date_from || !date_to) {
      return res.status(400).json({
        success: false,
        error: 'date_from and date_to parameters are required'
      });
    }

    try {
      // Generate summary for date range
      const startDate = new Date(date_from as string);
      const endDate = new Date(date_to as string);
      
      // For simplicity, generate daily reports for each day in range
      const reports = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailyReport = await reportService.generateDailySalesReport(dateStr, filters);
        reports.push(dailyReport);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Aggregate the data
      const summary = {
        date_from: date_from,
        date_to: date_to,
        total_sales: reports.reduce((sum, r) => sum + r.total_sales, 0),
        total_orders: reports.reduce((sum, r) => sum + r.total_orders, 0),
        total_cash: reports.reduce((sum, r) => sum + r.cash_sales, 0),
        total_card: reports.reduce((sum, r) => sum + r.card_sales, 0),
        total_upi: reports.reduce((sum, r) => sum + r.upi_sales, 0),
        total_online: reports.reduce((sum, r) => sum + r.online_sales, 0),
        daily_reports: reports
      };
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get top selling items for period
  getTopSellingItems: catchAsync(async (req: Request, res: Response) => {
    const { date_from, date_to } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: ReportFilters = {
      date_from: date_from as string,
      date_to: date_to as string,
      payment_method: req.query.payment_method as any,
      order_type: req.query.order_type as any,
      cashier_id: req.query.cashier_id as string
    };

    if (!date_from || !date_to) {
      return res.status(400).json({
        success: false,
        error: 'date_from and date_to parameters are required'
      });
    }

    try {
      // This would be implemented with actual database queries
      // For now, returning mock data
      const topItems = [
        {
          product_id: '1',
          product_name: 'Cappuccino',
          quantity_sold: 150,
          revenue: 7500
        },
        {
          product_id: '2',
          product_name: 'Latte',
          quantity_sold: 120,
          revenue: 6000
        }
      ].slice(0, limit);

      res.json({
        success: true,
        data: topItems
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get payment method analytics
  getPaymentAnalytics: catchAsync(async (req: Request, res: Response) => {
    const { date_from, date_to } = req.query;
    const filters: ReportFilters = {
      date_from: date_from as string,
      date_to: date_to as string,
      order_type: req.query.order_type as any,
      cashier_id: req.query.cashier_id as string
    };

    if (!date_from || !date_to) {
      return res.status(400).json({
        success: false,
        error: 'date_from and date_to parameters are required'
      });
    }

    try {
      // This would be implemented with actual database queries
      const analytics = {
        cash: { count: 45, amount: 22500, percentage: 30 },
        card: { count: 35, amount: 17500, percentage: 23.3 },
        upi: { count: 50, amount: 25000, percentage: 33.3 },
        online: { count: 20, amount: 10000, percentage: 13.3 }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Regenerate report (for reprinting)
  regenerateReport: catchAsync(async (req: Request, res: Response) => {
    const { type, period } = req.params;
    const filters: ReportFilters = req.body.filters || {};

    if (!type || !period) {
      return res.status(400).json({
        success: false,
        error: 'Type and period parameters are required'
      });
    }

    try {
      let report;
      
      if (type === 'daily') {
        report = await reportService.generateDailySalesReport(period, filters);
      } else {
        const [month, year] = period.split('-');
        report = await reportService.generateMonthlySalesReport(
          month, 
          parseInt(year), 
          filters
        );
      }

      res.json({
        success: true,
        data: report,
        message: 'Report regenerated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
};