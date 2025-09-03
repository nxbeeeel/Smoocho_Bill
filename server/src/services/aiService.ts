import { Product } from '../types';

export interface AIInsight {
  type: 'trend' | 'prediction' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SalesPrediction {
  productId: string;
  productName: string;
  predictedDemand: number;
  confidence: number;
  factors: string[];
  recommendedAction: string;
}

export interface CustomerInsight {
  customerId: string;
  preferences: string[];
  lifetimeValue: number;
  nextPurchasePrediction: Date;
  recommendedProducts: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface InventoryOptimization {
  itemId: string;
  itemName: string;
  currentStock: number;
  recommendedStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  costSavings: number;
  reasoning: string[];
}

export class AIService {
  // Smart inventory management with ML predictions
  async predictInventoryNeeds(historicalData: any[]): Promise<InventoryOptimization[]> {
    // Mock AI implementation - in production, this would use real ML models
    const predictions: InventoryOptimization[] = [
      {
        itemId: 'inv-1',
        itemName: 'Milk',
        currentStock: 50,
        recommendedStock: 75,
        reorderPoint: 20,
        reorderQuantity: 30,
        costSavings: 150,
        reasoning: [
          'High demand on weekends',
          'Seasonal increase in summer',
          'Historical stockout patterns'
        ]
      },
      {
        itemId: 'inv-2',
        itemName: 'Sugar',
        currentStock: 25,
        recommendedStock: 40,
        reorderPoint: 10,
        reorderQuantity: 20,
        costSavings: 80,
        reasoning: [
          'Consistent weekly consumption',
          'Bulk discount available at 20kg',
          'Low storage cost'
        ]
      }
    ];

    return predictions;
  }

  // Sales forecasting using time series analysis
  async forecastSales(timeframe: 'daily' | 'weekly' | 'monthly', days: number): Promise<SalesPrediction[]> {
    // Mock AI implementation - in production, this would use ARIMA, LSTM, or similar models
    const forecasts: SalesPrediction[] = [
      {
        productId: 'prod-1',
        productName: 'Hazelnut Kunafa',
        predictedDemand: 45,
        confidence: 0.87,
        factors: [
          'Weekend peak demand',
          'Social media trending',
          'Seasonal dessert preference'
        ],
        recommendedAction: 'Increase production by 20% on weekends'
      },
      {
        productId: 'prod-2',
        productName: 'Pista Coffee Earthquake',
        predictedDemand: 32,
        confidence: 0.79,
        factors: [
          'Coffee culture growth',
          'Premium dessert market',
          'Instagram-worthy presentation'
        ],
        recommendedAction: 'Maintain current stock levels'
      }
    ];

    return forecasts;
  }

  // Customer behavior analysis and segmentation
  async analyzeCustomerBehavior(transactionHistory: any[]): Promise<CustomerInsight[]> {
    // Mock AI implementation - in production, this would use clustering and classification
    const insights: CustomerInsight[] = [
      {
        customerId: 'cust-1',
        preferences: ['Premium desserts', 'Coffee-based items', 'Instagram-worthy food'],
        lifetimeValue: 1250,
        nextPurchasePrediction: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        recommendedProducts: ['prod-1', 'prod-2', 'prod-3'],
        riskLevel: 'low'
      },
      {
        customerId: 'cust-2',
        preferences: ['Traditional items', 'Value for money', 'Family portions'],
        lifetimeValue: 890,
        nextPurchasePrediction: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        recommendedProducts: ['prod-4', 'prod-5'],
        riskLevel: 'medium'
      }
    ];

    return insights;
  }

  // Dynamic pricing optimization
  async optimizePricing(products: Product[], marketData: any): Promise<Map<string, number>> {
    // Mock AI implementation - in production, this would use price elasticity and demand modeling
    const priceOptimizations = new Map<string, number>();
    
    products.forEach(product => {
      // Simple mock logic - real AI would consider:
      // - Price elasticity
      // - Competitor pricing
      // - Demand patterns
      // - Cost fluctuations
      // - Seasonal factors
      
      let optimizedPrice = product.price;
      
      if (product.category_id === 'cat-1') { // Premium category
        optimizedPrice *= 1.05; // 5% increase for premium items
      } else if (product.category_id === 'cat-3') { // Rice category
        optimizedPrice *= 0.98; // 2% decrease for competitive items
      }
      
      priceOptimizations.set(product.id, Math.round(optimizedPrice * 100) / 100);
    });

    return priceOptimizations;
  }

  // Menu optimization using customer preferences
  async optimizeMenu(products: Product[], customerData: any[]): Promise<{
    recommended: string[];
    toRemove: string[];
    newSuggestions: string[];
  }> {
    // Mock AI implementation - in production, this would use collaborative filtering
    return {
      recommended: ['prod-1', 'prod-2', 'prod-3'], // High-performing items
      toRemove: ['prod-10', 'prod-15'], // Low-performing items
      newSuggestions: [
        'Matcha Green Tea Kunafa',
        'Saffron Rice Pudding',
        'Rose Water Ice Cream'
      ]
    };
  }

  // Fraud detection for transactions
  async detectFraud(transaction: any): Promise<{
    isFraudulent: boolean;
    riskScore: number;
    reasons: string[];
  }> {
    // Mock AI implementation - in production, this would use anomaly detection
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check for suspicious patterns
    if (transaction.amount > 1000) {
      riskScore += 30;
      riskFactors.push('High transaction amount');
    }

    if (transaction.time.getHours() < 6 || transaction.time.getHours() > 23) {
      riskScore += 20;
      riskFactors.push('Unusual transaction time');
    }

    if (transaction.customer_id && transaction.customer_id.includes('guest')) {
      riskScore += 15;
      riskFactors.push('Guest customer with high amount');
    }

    return {
      isFraudulent: riskScore > 50,
      riskScore,
      reasons: riskFactors
    };
  }

  // Smart inventory reordering
  async generateReorderRecommendations(): Promise<{
    urgent: string[];
    normal: string[];
    bulk: string[];
  }> {
    // Mock AI implementation - in production, this would use demand forecasting
    return {
      urgent: ['Milk', 'Fresh cream'], // Items needed immediately
      normal: ['Sugar', 'Flour', 'Butter'], // Regular reorders
      bulk: ['Rice', 'Dry fruits'] // Items for bulk purchase
    };
  }

  // Customer churn prediction
  async predictCustomerChurn(customerId: string, behaviorData: any): Promise<{
    churnProbability: number;
    nextBestAction: string;
    retentionStrategies: string[];
  }> {
    // Mock AI implementation - in production, this would use survival analysis
    const churnProbability = Math.random() * 0.3; // 0-30% for demo
    
    let nextBestAction = 'Maintain current engagement';
    let retentionStrategies = ['Regular communication', 'Loyalty rewards'];

    if (churnProbability > 0.2) {
      nextBestAction = 'Immediate intervention required';
      retentionStrategies = [
        'Personalized offers',
        'Customer success call',
        'Exclusive early access'
      ];
    } else if (churnProbability > 0.1) {
      nextBestAction = 'Increase engagement';
      retentionStrategies = [
        'Targeted promotions',
        'Social media engagement',
        'Referral program'
      ];
    }

    return {
      churnProbability,
      nextBestAction,
      retentionStrategies
    };
  }

  // Seasonal trend analysis
  async analyzeSeasonalTrends(): Promise<{
    currentTrends: string[];
    upcomingTrends: string[];
    recommendations: string[];
  }> {
    // Mock AI implementation - in production, this would use time series decomposition
    const currentMonth = new Date().getMonth();
    
    let currentTrends: string[] = [];
    let upcomingTrends: string[] = [];
    let recommendations: string[] = [];

    if (currentMonth >= 5 && currentMonth <= 8) { // Summer
      currentTrends = ['Cold desserts', 'Iced beverages', 'Light items'];
      upcomingTrends = ['Fall flavors', 'Warm desserts', 'Spiced items'];
      recommendations = [
        'Increase ice cream production',
        'Prepare for pumpkin spice season',
        'Stock up on cooling ingredients'
      ];
    } else if (currentMonth >= 9 && currentMonth <= 11) { // Fall
      currentTrends = ['Warm desserts', 'Spiced items', 'Comfort food'];
      upcomingTrends = ['Holiday specials', 'Gift items', 'Party food'];
      recommendations = [
        'Introduce holiday menu',
        'Prepare gift packaging',
        'Increase production capacity'
      ];
    }

    return {
      currentTrends,
      upcomingTrends,
      recommendations
    };
  }

  // Smart staffing recommendations
  async recommendStaffing(hourlyData: any[]): Promise<{
    recommendedStaff: number;
    peakHours: string[];
    quietHours: string[];
    costSavings: number;
  }> {
    // Mock AI implementation - in production, this would use workforce optimization
    return {
      recommendedStaff: 8,
      peakHours: ['12:00-14:00', '18:00-20:00'],
      quietHours: ['15:00-17:00', '21:00-23:00'],
      costSavings: 1200
    };
  }
}

export const aiService = new AIService();
