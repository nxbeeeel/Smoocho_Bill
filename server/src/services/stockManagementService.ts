import { inventoryService, InventoryItem } from './inventoryService';

export interface StockCount {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  countedQuantity: number;
  previousQuantity: number;
  difference: number;
  countType: 'daily' | 'nightly' | 'manual' | 'audit';
  countedBy: string;
  countedAt: Date;
  notes?: string;
  location?: string;
}

export interface StockAdjustment {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  adjustmentType: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: Date;
  reference?: string;
  notes?: string;
}

export interface StockReport {
  itemId: string;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  lastCounted: Date;
  lastCountedBy: string;
  lastCountedQuantity: number;
  variance: number;
  status: 'normal' | 'low' | 'critical' | 'overstock';
}

export class StockManagementService {
  private stockCounts: Map<string, StockCount> = new Map();
  private stockAdjustments: Map<string, StockAdjustment> = new Map();

  // Perform daily stock count
  async performDailyCount(counts: Array<{
    inventoryItemId: string;
    countedQuantity: number;
    notes?: string;
    location?: string;
  }>, countedBy: string): Promise<{
    success: boolean;
    counts: StockCount[];
    errors: string[];
  }> {
    const results: StockCount[] = [];
    const errors: string[] = [];

    for (const count of counts) {
      try {
        const inventoryItem = await inventoryService.getInventoryItemById(count.inventoryItemId);
        if (!inventoryItem) {
          errors.push(`Inventory item ${count.inventoryItemId} not found`);
          continue;
        }

        const previousQuantity = inventoryItem.current_stock;
        const difference = count.countedQuantity - previousQuantity;

        // Create stock count record
        const stockCount: StockCount = {
          id: `count-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          inventoryItemId: count.inventoryItemId,
          inventoryItemName: inventoryItem.name,
          countedQuantity: count.countedQuantity,
          previousQuantity,
          difference,
          countType: 'daily',
          countedBy,
          countedAt: new Date(),
          notes: count.notes,
          location: count.location
        };

        this.stockCounts.set(stockCount.id, stockCount);

        // Update inventory with counted quantity
        await inventoryService.updateInventoryItem(count.inventoryItemId, {
          current_stock: count.countedQuantity
        });

        // Add stock transaction record
        if (difference !== 0) {
          await inventoryService.addStockTransaction({
            inventory_item_id: count.inventoryItemId,
            transaction_type: difference > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(difference),
            cost_per_unit: inventoryItem.cost_per_unit,
            reference_type: 'DAILY_COUNT',
            reference_id: stockCount.id,
            notes: `Daily count adjustment: ${difference > 0 ? 'Found' : 'Missing'} ${Math.abs(difference)} ${inventoryItem.unit}`,
            user_id: countedBy
          });
        }

        results.push(stockCount);

      } catch (error) {
        errors.push(`Error counting ${count.inventoryItemId}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      counts: results,
      errors
    };
  }

  // Perform nightly stock count
  async performNightlyCount(counts: Array<{
    inventoryItemId: string;
    countedQuantity: number;
    notes?: string;
    location?: string;
  }>, countedBy: string): Promise<{
    success: boolean;
    counts: StockCount[];
    errors: string[];
  }> {
    const results: StockCount[] = [];
    const errors: string[] = [];

    for (const count of counts) {
      try {
        const inventoryItem = await inventoryService.getInventoryItemById(count.inventoryItemId);
        if (!inventoryItem) {
          errors.push(`Inventory item ${count.inventoryItemId} not found`);
          continue;
        }

        const previousQuantity = inventoryItem.current_stock;
        const difference = count.countedQuantity - previousQuantity;

        // Create stock count record
        const stockCount: StockCount = {
          id: `count-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          inventoryItemId: count.inventoryItemId,
          inventoryItemName: inventoryItem.name,
          countedQuantity: count.countedQuantity,
          previousQuantity,
          difference,
          countType: 'nightly',
          countedBy,
          countedAt: new Date(),
          notes: count.notes,
          location: count.location
        };

        this.stockCounts.set(stockCount.id, stockCount);

        // Update inventory with counted quantity
        await inventoryService.updateInventoryItem(count.inventoryItemId, {
          current_stock: count.countedQuantity
        });

        // Add stock transaction record
        if (difference !== 0) {
          await inventoryService.addStockTransaction({
            inventory_item_id: count.inventoryItemId,
            transaction_type: difference > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(difference),
            cost_per_unit: inventoryItem.cost_per_unit,
            reference_type: 'NIGHTLY_COUNT',
            reference_id: stockCount.id,
            notes: `Nightly count adjustment: ${difference > 0 ? 'Found' : 'Missing'} ${Math.abs(difference)} ${inventoryItem.unit}`,
            user_id: countedBy
          });
        }

        results.push(stockCount);

      } catch (error) {
        errors.push(`Error counting ${count.inventoryItemId}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      counts: results,
      errors
    };
  }

  // Manual stock adjustment
  async adjustStock(adjustment: Omit<StockAdjustment, 'id' | 'adjustedAt'>): Promise<{
    success: boolean;
    adjustment: StockAdjustment;
    errors: string[];
  }> {
    try {
      const inventoryItem = await inventoryService.getInventoryItemById(adjustment.inventoryItemId);
      if (!inventoryItem) {
        return {
          success: false,
          adjustment: {} as StockAdjustment,
          errors: ['Inventory item not found']
        };
      }

      let newQuantity: number;
      switch (adjustment.adjustmentType) {
        case 'add':
          newQuantity = inventoryItem.current_stock + adjustment.quantity;
          break;
        case 'subtract':
          newQuantity = inventoryItem.current_stock - adjustment.quantity;
          if (newQuantity < 0) {
            return {
              success: false,
              adjustment: {} as StockAdjustment,
              errors: ['Cannot subtract more than current stock']
            };
          }
          break;
        case 'set':
          newQuantity = adjustment.quantity;
          break;
        default:
          return {
            success: false,
            adjustment: {} as StockAdjustment,
            errors: ['Invalid adjustment type']
          };
      }

      // Create adjustment record
      const stockAdjustment: StockAdjustment = {
        ...adjustment,
        id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        adjustedAt: new Date()
      };

      this.stockAdjustments.set(stockAdjustment.id, stockAdjustment);

      // Update inventory
      await inventoryService.updateInventoryItem(adjustment.inventoryItemId, {
        current_stock: newQuantity
      });

      // Add stock transaction record
      const transactionType = adjustment.adjustmentType === 'add' ? 'IN' : 
                             adjustment.adjustmentType === 'subtract' ? 'OUT' : 'ADJUSTMENT';
      
      await inventoryService.addStockTransaction({
        inventory_item_id: adjustment.inventoryItemId,
        transaction_type: transactionType,
        quantity: Math.abs(newQuantity - inventoryItem.current_stock),
        cost_per_unit: inventoryItem.cost_per_unit,
        reference_type: 'MANUAL_ADJUSTMENT',
        reference_id: stockAdjustment.id,
        notes: `Manual adjustment: ${adjustment.reason}`,
        user_id: adjustment.adjustedBy
      });

      return {
        success: true,
        adjustment: stockAdjustment,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        adjustment: {} as StockAdjustment,
        errors: [`Error adjusting stock: ${error}`]
      };
    }
  }

  // Get stock counts by type and date range
  async getStockCounts(filters: {
    countType?: 'daily' | 'nightly' | 'manual' | 'audit';
    startDate?: Date;
    endDate?: Date;
    countedBy?: string;
    limit?: number;
  } = {}): Promise<StockCount[]> {
    let counts = Array.from(this.stockCounts.values());

    if (filters.countType) {
      counts = counts.filter(count => count.countType === filters.countType);
    }

    if (filters.startDate) {
      counts = counts.filter(count => count.countedAt >= filters.startDate!);
    }

    if (filters.endDate) {
      counts = counts.filter(count => count.countedAt <= filters.endDate!);
    }

    if (filters.countedBy) {
      counts = counts.filter(count => count.countedBy === filters.countedBy);
    }

    // Sort by count date (newest first)
    counts.sort((a, b) => b.countedAt.getTime() - a.countedAt.getTime());

    if (filters.limit) {
      counts = counts.slice(0, filters.limit);
    }

    return counts;
  }

  // Get stock adjustments by date range
  async getStockAdjustments(filters: {
    startDate?: Date;
    endDate?: Date;
    adjustedBy?: string;
    adjustmentType?: 'add' | 'subtract' | 'set';
    limit?: number;
  } = {}): Promise<StockAdjustment[]> {
    let adjustments = Array.from(this.stockAdjustments.values());

    if (filters.startDate) {
      adjustments = adjustments.filter(adj => adj.adjustedAt >= filters.startDate!);
    }

    if (filters.endDate) {
      adjustments = adjustments.filter(adj => adj.adjustedAt <= filters.endDate!);
    }

    if (filters.adjustedBy) {
      adjustments = adjustments.filter(adj => adj.adjustedBy === filters.adjustedBy);
    }

    if (filters.adjustmentType) {
      adjustments = adjustments.filter(adj => adj.adjustmentType === filters.adjustmentType);
    }

    // Sort by adjustment date (newest first)
    adjustments.sort((a, b) => b.adjustedAt.getTime() - a.adjustedAt.getTime());

    if (filters.limit) {
      adjustments = adjustments.slice(0, filters.limit);
    }

    return adjustments;
  }

  // Generate comprehensive stock report
  async generateStockReport(): Promise<StockReport[]> {
    const inventoryItems = await inventoryService.getAllInventoryItems();
    const reports: StockReport[] = [];

    for (const item of inventoryItems) {
      // Get last count for this item
      const lastCount = Array.from(this.stockCounts.values())
        .filter(count => count.inventoryItemId === item.id)
        .sort((a, b) => b.countedAt.getTime() - a.countedAt.getTime())[0];

      // Calculate variance from last count
      const variance = lastCount ? item.current_stock - lastCount.countedQuantity : 0;

      // Determine status
      let status: 'normal' | 'low' | 'critical' | 'overstock' = 'normal';
      if (item.current_stock <= item.minimum_stock) {
        status = item.current_stock <= item.minimum_stock * 0.5 ? 'critical' : 'low';
      } else if (item.current_stock > item.maximum_stock) {
        status = 'overstock';
      }

      reports.push({
        itemId: item.id,
        itemName: item.name,
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
        maximumStock: item.maximum_stock,
        unit: item.unit,
        lastCounted: lastCount?.countedAt || new Date(0),
        lastCountedBy: lastCount?.countedBy || 'Never',
        lastCountedQuantity: lastCount?.countedQuantity || 0,
        variance,
        status
      });
    }

    return reports;
  }

  // Get items that need counting (haven't been counted recently)
  async getItemsNeedingCount(daysThreshold: number = 1): Promise<{
    critical: StockReport[];
    warning: StockReport[];
    normal: StockReport[];
  }> {
    const reports = await this.generateStockReport();
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);

    const critical: StockReport[] = [];
    const warning: StockReport[] = [];
    const normal: StockReport[] = [];

    for (const report of reports) {
      if (report.lastCounted < thresholdDate) {
        if (report.status === 'critical') {
          critical.push(report);
        } else if (report.status === 'low') {
          warning.push(report);
        } else {
          normal.push(report);
        }
      }
    }

    return { critical, warning, normal };
  }

  // Get stock count summary for a specific date
  async getDailyCountSummary(date: Date): Promise<{
    totalItems: number;
    countedItems: number;
    uncountedItems: number;
    totalVariance: number;
    itemsWithVariance: number;
  }> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const dailyCounts = await this.getStockCounts({
      countType: 'daily',
      startDate: startOfDay,
      endDate: endOfDay
    });

    const allItems = await inventoryService.getAllInventoryItems();
    const countedItems = dailyCounts.length;
    const uncountedItems = allItems.length - countedItems;
    const totalVariance = dailyCounts.reduce((sum, count) => sum + Math.abs(count.difference), 0);
    const itemsWithVariance = dailyCounts.filter(count => count.difference !== 0).length;

    return {
      totalItems: allItems.length,
      countedItems,
      uncountedItems,
      totalVariance,
      itemsWithVariance
    };
  }
}

export const stockManagementService = new StockManagementService();
