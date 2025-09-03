import { 
  Promotion, 
  PromotionUsage, 
  DiscountApplication,
  Order,
  Product,
  Category,
  AuditLog
} from '../types';

/**
 * Promotion Management Service
 * 
 * Handles promotion and discount code management with:
 * - Promotion CRUD operations
 * - Discount validation and application
 * - Usage tracking and limits
 * - Time-based promotions
 * - Product/category-specific discounts
 * - Buy X Get Y promotions
 * - Audit logging
 */
export class PromotionService {
  // In-memory stores (in production, use database)
  private promotions: Map<string, Promotion> = new Map();
  private promotionUsages: PromotionUsage[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.createSamplePromotions();
    console.log('🎯 Promotion service initialized');
  }

  // Create sample promotions for testing
  private createSamplePromotions(): void {
    const samplePromotions: Promotion[] = [
      {
        id: 'promo_001',
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off for new customers',
        type: 'percentage',
        value: 10,
        minimum_order_amount: 100,
        maximum_discount_amount: 50,
        usage_limit: 100,
        usage_limit_per_customer: 1,
        used_count: 15,
        is_active: true,
        valid_from: new Date('2025-01-01'),
        valid_to: new Date('2025-12-31'),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'admin_001'
      },
      {
        id: 'promo_002',
        code: 'SAVE20',
        name: 'Fixed Discount',
        description: 'Save ₹20 on orders above ₹200',
        type: 'fixed_amount',
        value: 20,
        minimum_order_amount: 200,
        usage_limit: 50,
        used_count: 8,
        is_active: true,
        valid_from: new Date('2025-01-01'),
        valid_to: new Date('2025-06-30'),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'admin_001'
      },
      {
        id: 'promo_003',
        code: 'FRIDAY15',
        name: 'Friday Special',
        description: '15% off on Fridays',
        type: 'percentage',
        value: 15,
        minimum_order_amount: 150,
        maximum_discount_amount: 100,
        is_active: true,
        valid_from: new Date('2025-01-01'),
        valid_to: new Date('2025-12-31'),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'admin_001'
      }
    ];

    samplePromotions.forEach(promotion => {
      this.promotions.set(promotion.id, promotion);
    });

    console.log(`✅ Created ${samplePromotions.length} sample promotions`);
  }

  // Create new promotion
  async createPromotion(
    promotionData: Omit<Promotion, 'id' | 'used_count' | 'created_at' | 'updated_at'>,
    createdBy: string
  ): Promise<Promotion> {
    // Validate promotion data
    this.validatePromotionData(promotionData);

    // Check if code already exists
    const existingPromotion = this.getPromotionByCode(promotionData.code);
    if (existingPromotion) {
      throw new Error(`Promotion code '${promotionData.code}' already exists`);
    }

    // Generate promotion ID
    const promotionId = this.generatePromotionId();

    const promotion: Promotion = {
      ...promotionData,
      id: promotionId,
      used_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: createdBy
    };

    this.promotions.set(promotionId, promotion);

    // Log audit
    await this.logAudit({
      user_id: createdBy,
      action: 'create_promotion',
      resource_type: 'promotions',
      resource_id: promotionId,
      new_values: { code: promotion.code, name: promotion.name, type: promotion.type, value: promotion.value },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`🎯 Promotion created: ${promotion.code} (${promotion.type}: ${promotion.value})`);
    return promotion;
  }

  // Update promotion
  async updatePromotion(
    promotionId: string,
    updates: Partial<Promotion>,
    updatedBy: string
  ): Promise<Promotion> {
    const promotion = this.promotions.get(promotionId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    const oldValues = {
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      is_active: promotion.is_active
    };

    // Validate updates
    if (updates.code && updates.code !== promotion.code) {
      const existingPromotion = this.getPromotionByCode(updates.code);
      if (existingPromotion && existingPromotion.id !== promotionId) {
        throw new Error(`Promotion code '${updates.code}' already exists`);
      }
    }

    // Apply updates
    Object.assign(promotion, updates, { updated_at: new Date() });

    // Validate the updated promotion
    this.validatePromotionData(promotion);

    // Log audit
    await this.logAudit({
      user_id: updatedBy,
      action: 'update_promotion',
      resource_type: 'promotions',
      resource_id: promotionId,
      old_values: oldValues,
      new_values: {
        code: promotion.code,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
        is_active: promotion.is_active
      },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`🎯 Promotion updated: ${promotion.code}`);
    return promotion;
  }

  // Delete promotion
  async deletePromotion(promotionId: string, deletedBy: string): Promise<void> {
    const promotion = this.promotions.get(promotionId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    // Check if promotion has been used
    const usages = this.getPromotionUsages(promotionId);
    if (usages.length > 0) {
      throw new Error('Cannot delete promotion that has been used');
    }

    this.promotions.delete(promotionId);

    // Log audit
    await this.logAudit({
      user_id: deletedBy,
      action: 'delete_promotion',
      resource_type: 'promotions',
      resource_id: promotionId,
      old_values: { code: promotion.code, name: promotion.name },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`🎯 Promotion deleted: ${promotion.code}`);
  }

  // Get promotion by ID
  getPromotionById(promotionId: string): Promotion | null {
    return this.promotions.get(promotionId) || null;
  }

  // Get promotion by code
  getPromotionByCode(code: string): Promotion | null {
    return Array.from(this.promotions.values()).find(p => p.code.toLowerCase() === code.toLowerCase()) || null;
  }

  // Get all promotions
  getPromotions(filter?: {
    is_active?: boolean;
    type?: Promotion['type'];
    search?: string;
  }): Promotion[] {
    let promotions = Array.from(this.promotions.values());

    if (filter) {
      if (filter.is_active !== undefined) {
        promotions = promotions.filter(p => p.is_active === filter.is_active);
      }

      if (filter.type) {
        promotions = promotions.filter(p => p.type === filter.type);
      }

      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        promotions = promotions.filter(p => 
          p.code.toLowerCase().includes(searchTerm) ||
          p.name.toLowerCase().includes(searchTerm) ||
          (p.description && p.description.toLowerCase().includes(searchTerm))
        );
      }
    }

    return promotions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  // Get active promotions
  getActivePromotions(): Promotion[] {
    const now = new Date();
    return this.getPromotions({ is_active: true })
      .filter(p => p.valid_from <= now && p.valid_to >= now);
  }

  // Validate and apply promotion to order
  async validateAndApplyPromotion(
    promotionCode: string,
    order: Pick<Order, 'subtotal' | 'items'> & { customer_phone?: string },
    orderItems: Array<{ product_id: string; quantity: number; price: number }>
  ): Promise<DiscountApplication> {
    const promotion = this.getPromotionByCode(promotionCode);
    
    if (!promotion) {
      throw new Error('Invalid promotion code');
    }

    if (!promotion.is_active) {
      throw new Error('Promotion is not active');
    }

    const now = new Date();
    if (promotion.valid_from > now) {
      throw new Error('Promotion is not yet valid');
    }

    if (promotion.valid_to < now) {
      throw new Error('Promotion has expired');
    }

    // Check minimum order amount
    if (promotion.minimum_order_amount && order.subtotal < promotion.minimum_order_amount) {
      throw new Error(`Minimum order amount ₹${promotion.minimum_order_amount} required`);
    }

    // Check usage limits
    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
      throw new Error('Promotion usage limit exceeded');
    }

    // Check per-customer usage limit
    if (promotion.usage_limit_per_customer && order.customer_phone) {
      const customerUsages = this.getCustomerPromotionUsages(promotion.id, order.customer_phone);
      if (customerUsages.length >= promotion.usage_limit_per_customer) {
        throw new Error('Customer usage limit exceeded for this promotion');
      }
    }

    // Check day-of-week restrictions (for promotions like FRIDAY15)
    if (promotion.code === 'FRIDAY15' && now.getDay() !== 5) { // Friday = 5
      throw new Error('This promotion is only valid on Fridays');
    }

    // Apply discount based on type
    const discountApplication = this.calculateDiscount(promotion, order, orderItems);
    
    console.log(`🎯 Promotion applied: ${promotion.code} - ₹${discountApplication.discount_amount} discount`);
    return discountApplication;
  }

  // Calculate discount amount
  private calculateDiscount(
    promotion: Promotion,
    order: Pick<Order, 'subtotal'>,
    orderItems: Array<{ product_id: string; quantity: number; price: number }>
  ): DiscountApplication {
    let discountAmount = 0;
    let applicableItems: DiscountApplication['applicable_items'] = [];

    switch (promotion.type) {
      case 'percentage':
        discountAmount = (order.subtotal * promotion.value) / 100;
        
        // Apply maximum discount limit
        if (promotion.maximum_discount_amount) {
          discountAmount = Math.min(discountAmount, promotion.maximum_discount_amount);
        }
        break;

      case 'fixed_amount':
        discountAmount = promotion.value;
        break;

      case 'category_discount':
        // Apply discount only to items in specific categories
        if (promotion.applicable_categories) {
          const categoryItems = orderItems.filter(item => 
            this.isItemInCategories(item.product_id, promotion.applicable_categories!)
          );
          
          const categorySubtotal = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          discountAmount = (categorySubtotal * promotion.value) / 100;
          
          applicableItems = categoryItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            original_price: item.price,
            discounted_price: item.price * (1 - promotion.value / 100)
          }));
        }
        break;

      case 'buy_x_get_y':
        // Buy X Get Y logic (simplified - buy 2 get 1 free)
        if (promotion.value === 1) { // Buy 2 get 1 free
          const eligibleItems = promotion.applicable_products 
            ? orderItems.filter(item => promotion.applicable_products!.includes(item.product_id))
            : orderItems;
          
          for (const item of eligibleItems) {
            if (item.quantity >= 3) {
              const freeItems = Math.floor(item.quantity / 3);
              discountAmount += freeItems * item.price;
              
              applicableItems!.push({
                product_id: item.product_id,
                quantity: freeItems,
                original_price: item.price,
                discounted_price: 0
              });
            }
          }
        }
        break;
    }

    return {
      promotion_id: promotion.id,
      promotion_code: promotion.code,
      discount_type: promotion.type === 'percentage' ? 'percentage' : 'fixed_amount',
      discount_value: promotion.value,
      discount_amount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      applicable_items: applicableItems
    };
  }

  // Record promotion usage
  async recordPromotionUsage(
    promotionId: string,
    orderId: string,
    discountAmount: number,
    customerPhone?: string
  ): Promise<void> {
    const promotion = this.promotions.get(promotionId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    // Create usage record
    const usage: PromotionUsage = {
      id: this.generateUsageId(),
      promotion_id: promotionId,
      order_id: orderId,
      customer_phone: customerPhone,
      discount_amount: discountAmount,
      applied_at: new Date()
    };

    this.promotionUsages.push(usage);

    // Increment used count
    promotion.used_count++;
    promotion.updated_at = new Date();

    console.log(`🎯 Promotion usage recorded: ${promotion.code} for order ${orderId}`);
  }

  // Get promotion usages
  getPromotionUsages(promotionId: string): PromotionUsage[] {
    return this.promotionUsages.filter(u => u.promotion_id === promotionId);
  }

  // Get customer promotion usages
  getCustomerPromotionUsages(promotionId: string, customerPhone: string): PromotionUsage[] {
    return this.promotionUsages.filter(u => 
      u.promotion_id === promotionId && u.customer_phone === customerPhone
    );
  }

  // Get promotion statistics
  getPromotionStatistics(promotionId: string): {
    total_usage: number;
    total_discount_given: number;
    unique_customers: number;
    usage_by_day: Array<{ date: string; usage_count: number; discount_amount: number }>;
  } {
    const usages = this.getPromotionUsages(promotionId);
    
    const totalDiscountGiven = usages.reduce((sum, u) => sum + u.discount_amount, 0);
    const uniqueCustomers = new Set(usages.filter(u => u.customer_phone).map(u => u.customer_phone)).size;
    
    // Group by day
    const usageByDay = new Map<string, { count: number; discount: number }>();
    
    usages.forEach(usage => {
      const date = usage.applied_at.toISOString().split('T')[0];
      const existing = usageByDay.get(date) || { count: 0, discount: 0 };
      existing.count++;
      existing.discount += usage.discount_amount;
      usageByDay.set(date, existing);
    });

    return {
      total_usage: usages.length,
      total_discount_given: totalDiscountGiven,
      unique_customers: uniqueCustomers,
      usage_by_day: Array.from(usageByDay.entries()).map(([date, data]) => ({
        date,
        usage_count: data.count,
        discount_amount: data.discount
      }))
    };
  }

  // Validate promotion data
  private validatePromotionData(promotion: Partial<Promotion>): void {
    if (!promotion.code || promotion.code.length < 3) {
      throw new Error('Promotion code must be at least 3 characters long');
    }

    if (!promotion.name || promotion.name.length < 3) {
      throw new Error('Promotion name must be at least 3 characters long');
    }

    if (!promotion.type) {
      throw new Error('Promotion type is required');
    }

    if (promotion.value === undefined || promotion.value <= 0) {
      throw new Error('Promotion value must be greater than 0');
    }

    if (promotion.type === 'percentage' && promotion.value > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }

    if (!promotion.valid_from || !promotion.valid_to) {
      throw new Error('Valid from and valid to dates are required');
    }

    if (promotion.valid_from >= promotion.valid_to) {
      throw new Error('Valid from date must be before valid to date');
    }

    if (promotion.minimum_order_amount && promotion.minimum_order_amount < 0) {
      throw new Error('Minimum order amount cannot be negative');
    }

    if (promotion.usage_limit && promotion.usage_limit < 0) {
      throw new Error('Usage limit cannot be negative');
    }

    if (promotion.usage_limit_per_customer && promotion.usage_limit_per_customer < 0) {
      throw new Error('Usage limit per customer cannot be negative');
    }
  }

  // Check if item belongs to specific categories
  private isItemInCategories(productId: string, categoryIds: string[]): boolean {
    // In a real implementation, this would query the database
    // For now, returning true for demonstration
    return true;
  }

  // Deactivate expired promotions
  deactivateExpiredPromotions(): number {
    const now = new Date();
    let deactivatedCount = 0;

    for (const promotion of this.promotions.values()) {
      if (promotion.is_active && promotion.valid_to < now) {
        promotion.is_active = false;
        promotion.updated_at = new Date();
        deactivatedCount++;
        console.log(`🎯 Deactivated expired promotion: ${promotion.code}`);
      }
    }

    if (deactivatedCount > 0) {
      console.log(`🧹 Deactivated ${deactivatedCount} expired promotions`);
    }

    return deactivatedCount;
  }

  // Get promotions summary
  getPromotionsSummary(): {
    total_promotions: number;
    active_promotions: number;
    expired_promotions: number;
    total_discount_given: number;
    total_usages: number;
    most_used_promotion: { code: string; usage_count: number } | null;
  } {
    const promotions = Array.from(this.promotions.values());
    const now = new Date();
    
    const activePromotions = promotions.filter(p => p.is_active && p.valid_to >= now);
    const expiredPromotions = promotions.filter(p => p.valid_to < now);
    
    const totalDiscountGiven = this.promotionUsages.reduce((sum, u) => sum + u.discount_amount, 0);
    const totalUsages = this.promotionUsages.length;
    
    // Find most used promotion
    const usageCounts = new Map<string, number>();
    this.promotionUsages.forEach(usage => {
      const count = usageCounts.get(usage.promotion_id) || 0;
      usageCounts.set(usage.promotion_id, count + 1);
    });
    
    let mostUsedPromotion: { code: string; usage_count: number } | null = null;
    let maxUsage = 0;
    
    for (const [promotionId, count] of usageCounts.entries()) {
      if (count > maxUsage) {
        const promotion = this.promotions.get(promotionId);
        if (promotion) {
          mostUsedPromotion = { code: promotion.code, usage_count: count };
          maxUsage = count;
        }
      }
    }

    return {
      total_promotions: promotions.length,
      active_promotions: activePromotions.length,
      expired_promotions: expiredPromotions.length,
      total_discount_given: totalDiscountGiven,
      total_usages: totalUsages,
      most_used_promotion: mostUsedPromotion
    };
  }

  // Utility methods
  private generatePromotionId(): string {
    return `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUsageId(): string {
    return `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Audit logging
  private async logAudit(audit: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: AuditLog = {
      ...audit,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.auditLogs.push(auditLog);

    // Keep only last 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
  }

  getAuditLogs(limit?: number): AuditLog[] {
    return limit ? this.auditLogs.slice(-limit) : this.auditLogs;
  }

  // Bulk operations
  async activatePromotions(promotionIds: string[], activatedBy: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of promotionIds) {
      try {
        await this.updatePromotion(id, { is_active: true }, activatedBy);
        success++;
      } catch (error) {
        failed++;
        console.error(`Failed to activate promotion ${id}:`, error.message);
      }
    }

    return { success, failed };
  }

  async deactivatePromotions(promotionIds: string[], deactivatedBy: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of promotionIds) {
      try {
        await this.updatePromotion(id, { is_active: false }, deactivatedBy);
        success++;
      } catch (error) {
        failed++;
        console.error(`Failed to deactivate promotion ${id}:`, error.message);
      }
    }

    return { success, failed };
  }

  // Export/Import promotions
  exportPromotions(): { promotions: Promotion[]; usages: PromotionUsage[] } {
    return {
      promotions: Array.from(this.promotions.values()),
      usages: this.promotionUsages
    };
  }

  async importPromotions(data: { promotions: Promotion[]; usages?: PromotionUsage[] }): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const promotion of data.promotions) {
      if (this.promotions.has(promotion.id)) {
        skipped++;
        continue;
      }

      this.promotions.set(promotion.id, promotion);
      imported++;
    }

    if (data.usages) {
      this.promotionUsages.push(...data.usages);
    }

    console.log(`📥 Imported ${imported} promotions, skipped ${skipped}`);
    return { imported, skipped };
  }
}

// Export singleton instance
export const promotionService = new PromotionService();