export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferences: string[];
  dietaryRestrictions: string[];
  favoriteItems: string[];
  visitHistory: Array<{
    date: Date;
    orderId: string;
    items: string[];
    total: number;
    rating?: number;
    feedback?: string;
  }>;
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  birthday?: Date;
  anniversary?: Date;
  specialOccasions: string[];
}

export interface LoyaltyProgram {
  tier: string;
  pointsRequired: number;
  benefits: string[];
  discounts: {
    percentage: number;
    applicableItems: string[];
  };
  exclusiveOffers: string[];
  priorityService: boolean;
}

export interface PersonalizedRecommendation {
  customerId: string;
  recommendations: Array<{
    productId: string;
    productName: string;
    reason: string;
    confidence: number;
    discount?: number;
  }>;
  seasonalSuggestions: string[];
  complementaryItems: string[];
}

export interface CustomerFeedback {
  orderId: string;
  customerId: string;
  rating: number;
  feedback: string;
  categories: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  actionRequired: boolean;
  followUpNeeded: boolean;
}

export class CustomerExperienceService {
  // Customer profile management
  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    // Mock implementation - in production, this would fetch from database
    return {
      id: customerId,
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      phone: '+971501234567',
      preferences: ['Premium desserts', 'Coffee items', 'Traditional flavors'],
      dietaryRestrictions: ['No nuts'],
      favoriteItems: ['Hazelnut Kunafa', 'Turkish Coffee', 'Baklava'],
      visitHistory: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          orderId: 'ord-001',
          items: ['Hazelnut Kunafa', 'Turkish Coffee'],
          total: 85.0,
          rating: 5,
          feedback: 'Excellent service and amazing taste!'
        }
      ],
      loyaltyPoints: 1250,
      tier: 'gold',
      birthday: new Date('1990-05-15'),
      anniversary: new Date('2020-03-20'),
      specialOccasions: ['Birthday', 'Anniversary']
    };
  }

  // Loyalty program management
  async getLoyaltyTiers(): Promise<LoyaltyProgram[]> {
    return [
      {
        tier: 'bronze',
        pointsRequired: 0,
        benefits: ['Welcome discount', 'Birthday treat'],
        discounts: { percentage: 5, applicableItems: ['All items'] },
        exclusiveOffers: ['Monthly newsletter'],
        priorityService: false
      },
      {
        tier: 'silver',
        pointsRequired: 500,
        benefits: ['Free delivery', 'Priority ordering', 'Exclusive menu access'],
        discounts: { percentage: 10, applicableItems: ['All items'] },
        exclusiveOffers: ['Early access to new items', 'Quarterly tasting events'],
        priorityService: true
      },
      {
        tier: 'gold',
        pointsRequired: 1000,
        benefits: ['VIP service', 'Custom orders', 'Chef\'s table experience'],
        discounts: { percentage: 15, applicableItems: ['Premium items'] },
        exclusiveOffers: ['Private dessert tasting', 'Annual celebration package'],
        priorityService: true
      },
      {
        tier: 'platinum',
        pointsRequired: 2500,
        benefits: ['All gold benefits', 'Personal chef consultation', 'Exclusive events'],
        discounts: { percentage: 20, applicableItems: ['All items'] },
        exclusiveOffers: ['Private events', 'Custom menu creation'],
        priorityService: true
      }
    ];
  }

  // Personalized recommendations engine
  async getPersonalizedRecommendations(customerId: string): Promise<PersonalizedRecommendation> {
    const profile = await this.getCustomerProfile(customerId);
    
    if (!profile) {
      throw new Error('Customer profile not found');
    }

    // Mock AI-powered recommendations
    const recommendations = [
      {
        productId: 'prod-1',
        productName: 'Hazelnut Kunafa',
        reason: 'Based on your love for premium desserts',
        confidence: 0.95,
        discount: 10
      },
      {
        productId: 'prod-2',
        productName: 'Pista Coffee Earthquake',
        reason: 'Similar to items you\'ve enjoyed before',
        confidence: 0.87
      },
      {
        productId: 'prod-3',
        productName: 'Classic Kunafa',
        reason: 'Popular among customers with similar preferences',
        confidence: 0.82
      }
    ];

    return {
      customerId,
      recommendations,
      seasonalSuggestions: [
        'Summer: Try our new ice cream kunafa',
        'Ramadan: Special iftar packages available'
      ],
      complementaryItems: [
        'Turkish Tea with your kunafa',
        'Arabic coffee to complete the experience'
      ]
    };
  }

  // Customer feedback analysis
  async analyzeCustomerFeedback(feedback: CustomerFeedback): Promise<{
    insights: string[];
    actions: string[];
    followUp: string[];
  }> {
    const insights: string[] = [];
    const actions: string[] = [];
    const followUp: string[] = [];

    // Analyze feedback sentiment and content
    if (feedback.rating >= 4) {
      insights.push('Positive customer experience');
      actions.push('Share positive feedback with team');
      actions.push('Consider featuring customer in testimonials');
    } else if (feedback.rating <= 2) {
      insights.push('Customer satisfaction needs improvement');
      actions.push('Immediate follow-up required');
      actions.push('Review service quality in affected areas');
      followUp.push('Apology and compensation offer');
      followUp.push('Service recovery plan');
    }

    // Analyze feedback categories
    if (feedback.categories.includes('service')) {
      actions.push('Review staff training needs');
    }
    if (feedback.categories.includes('quality')) {
      actions.push('Inspect ingredient quality');
      actions.push('Review preparation processes');
    }
    if (feedback.categories.includes('waiting')) {
      actions.push('Optimize order processing');
      actions.push('Review staffing during peak hours');
    }

    return { insights, actions, followUp };
  }

  // Customer retention strategies
  async generateRetentionStrategies(customerId: string): Promise<{
    strategies: string[];
    offers: Array<{
      type: string;
      description: string;
      discount: number;
      validity: number;
    }>;
    communication: Array<{
      channel: string;
      message: string;
      timing: string;
    }>;
  }> {
    const profile = await this.getCustomerProfile(customerId);
    
    if (!profile) {
      throw new Error('Customer profile not found');
    }

    const strategies: string[] = [];
    const offers: Array<{
      type: string;
      description: string;
      discount: number;
      validity: number;
    }> = [];
    const communication: Array<{
      channel: string;
      message: string;
      timing: string;
    }> = [];

    // Generate personalized retention strategies
    if (profile.loyaltyPoints < 500) {
      strategies.push('Encourage first loyalty tier upgrade');
      offers.push({
        type: 'Loyalty Boost',
        description: 'Double points on next 3 orders',
        discount: 0,
        validity: 30
      });
    }

    if (profile.visitHistory.length < 3) {
      strategies.push('Increase visit frequency');
      offers.push({
        type: 'Welcome Back',
        description: '20% off on your next visit',
        discount: 20,
        validity: 14
      });
    }

    // Birthday and anniversary offers
    const today = new Date();
    if (profile.birthday && 
        today.getMonth() === profile.birthday.getMonth() && 
        today.getDate() === profile.birthday.getDate()) {
      strategies.push('Birthday celebration');
      offers.push({
        type: 'Birthday Special',
        description: 'Free dessert on your birthday',
        discount: 100,
        validity: 7
      });
    }

    // Communication strategy
    communication.push({
      channel: 'Email',
      message: `Dear ${profile.name}, we miss you! Here's a special offer just for you.`,
      timing: '3 days after last visit'
    });

    communication.push({
      channel: 'SMS',
      message: 'Your favorite kunafa is waiting! Use code WELCOME for 15% off.',
      timing: '1 week after last visit'
    });

    return { strategies, offers, communication };
  }

  // Customer journey optimization
  async optimizeCustomerJourney(customerId: string): Promise<{
    touchpoints: Array<{
      stage: string;
      currentExperience: string;
      improvements: string[];
      metrics: string[];
    }>;
    automation: Array<{
      trigger: string;
      action: string;
      channel: string;
      timing: string;
    }>;
  }> {
    return {
      touchpoints: [
        {
          stage: 'Discovery',
          currentExperience: 'Social media and word-of-mouth',
          improvements: [
            'Google My Business optimization',
            'Instagram story highlights',
            'Customer testimonial videos'
          ],
          metrics: ['Social media reach', 'Website traffic', 'Brand mentions']
        },
        {
          stage: 'First Visit',
          currentExperience: 'Walk-in or online order',
          improvements: [
            'Welcome package for new customers',
            'Staff introduction and menu guidance',
            'Loyalty program enrollment'
          ],
          metrics: ['First-time customer conversion', 'Average order value', 'Customer satisfaction']
        },
        {
          stage: 'Repeat Visits',
          currentExperience: 'Regular customer service',
          improvements: [
            'Personalized recommendations',
            'Loyalty rewards redemption',
            'Exclusive member events'
          ],
          metrics: ['Repeat visit rate', 'Loyalty points usage', 'Customer lifetime value']
        },
        {
          stage: 'Advocacy',
          currentExperience: 'Word-of-mouth referrals',
          improvements: [
            'Referral program incentives',
            'Social media sharing rewards',
            'Customer ambassador program'
          ],
          metrics: ['Referral rate', 'Social media engagement', 'Brand advocacy score']
        }
      ],
      automation: [
        {
          trigger: 'New customer registration',
          action: 'Welcome email with loyalty program info',
          channel: 'Email',
          timing: 'Immediate'
        },
        {
          trigger: 'First order completion',
          action: 'Thank you message with feedback request',
          channel: 'SMS',
          timing: '2 hours after order'
        },
        {
          trigger: '7 days no visit',
          action: 'Re-engagement offer',
          channel: 'Email + SMS',
          timing: '7 days after last visit'
        },
        {
          trigger: 'Birthday',
          action: 'Birthday special offer',
          channel: 'Email + SMS',
          timing: 'Day of birthday'
        },
        {
          trigger: 'Loyalty tier upgrade',
          action: 'Congratulations and new benefits',
          channel: 'Email',
          timing: 'Immediate'
        }
      ]
    };
  }

  // Customer satisfaction measurement
  async measureCustomerSatisfaction(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
    overallScore: number;
    metrics: {
      netPromoterScore: number;
      customerSatisfactionScore: number;
      customerEffortScore: number;
    };
    trends: {
      improvement: string[];
      decline: string[];
      stable: string[];
    };
    recommendations: string[];
  }> {
    return {
      overallScore: 8.7,
      metrics: {
        netPromoterScore: 72,
        customerSatisfactionScore: 8.7,
        customerEffortScore: 2.3
      },
      trends: {
        improvement: [
          'Order accuracy improved by 15%',
          'Wait time reduced by 20%',
          'Staff friendliness rating increased'
        ],
        decline: [
          'Delivery time increased during peak hours',
          'Some menu items out of stock frequently'
        ],
        stable: [
          'Food quality consistently high',
          'Cleanliness standards maintained'
        ]
      },
      recommendations: [
        'Implement real-time inventory tracking',
        'Optimize delivery routes during peak hours',
        'Increase staff training on customer service',
        'Launch customer feedback collection program'
      ]
    };
  }
}

export const customerExperienceService = new CustomerExperienceService();
