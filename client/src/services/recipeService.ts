import { Product, InventoryItem, RecipeIngredient } from '../types';
import { inventoryService } from './inventoryService';
import { useNotificationStore } from '../store/notificationStore';

export interface RecipeValidationResult {
  isValid: boolean;
  insufficientItems: Array<{
    item_name: string;
    required: number;
    available: number;
    unit: string;
  }>;
  warnings: Array<{
    item_name: string;
    message: string;
  }>;
}

export interface StockDeductionResult {
  success: boolean;
  deductedItems: Array<{
    inventory_item_id: string;
    item_name: string;
    quantity_deducted: number;
    unit: string;
  }>;
  errors: string[];
}

export class RecipeService {
  // Validate if order can be fulfilled based on current stock
  async validateOrderStock(
    orderItems: Array<{
      product: Product;
      quantity: number;
    }>
  ): Promise<RecipeValidationResult> {
    const result: RecipeValidationResult = {
      isValid: true,
      insufficientItems: [],
      warnings: [],
    };

    // Get all inventory items for reference
    const inventoryItems = await inventoryService.getAllItems({
      isActive: true,
    });
    const inventoryMap = new Map(inventoryItems.map(item => [item.id, item]));

    // Track total required quantities for each inventory item across all products
    const totalRequirements = new Map<string, number>();

    // Calculate total requirements
    for (const orderItem of orderItems) {
      const { product, quantity } = orderItem;

      if (!product.recipe_items || !Array.isArray(product.recipe_items)) {
        continue;
      }

      for (const recipeItem of product.recipe_items as RecipeIngredient[]) {
        const totalNeeded = recipeItem.quantity * quantity;
        const currentTotal =
          totalRequirements.get(recipeItem.inventory_item_id) || 0;
        totalRequirements.set(
          recipeItem.inventory_item_id,
          currentTotal + totalNeeded
        );
      }
    }

    // Check availability for each required inventory item
    for (const [inventoryId, totalRequired] of totalRequirements.entries()) {
      const inventoryItem = inventoryMap.get(inventoryId);

      if (!inventoryItem) {
        result.isValid = false;
        result.insufficientItems.push({
          item_name: 'Unknown Item',
          required: totalRequired,
          available: 0,
          unit: 'unknown',
        });
        continue;
      }

      const available = inventoryItem.current_stock || 0;

      if (available < totalRequired) {
        result.isValid = false;
        result.insufficientItems.push({
          item_name: inventoryItem.name,
          required: totalRequired,
          available,
          unit: inventoryItem.unit,
        });
      } else if (
        available <
        totalRequired + (inventoryItem.minimum_stock || 0)
      ) {
        // Warning: this order will bring stock below minimum threshold
        result.warnings.push({
          item_name: inventoryItem.name,
          message: `Stock will go below minimum threshold (${inventoryItem.minimum_stock})`,
        });
      }
    }

    return result;
  }

  // Process stock deduction for an order
  async processStockDeduction(
    orderId: string,
    orderItems: Array<{
      product: Product;
      quantity: number;
    }>,
    _userId: string
  ): Promise<StockDeductionResult> {
    const result: StockDeductionResult = {
      success: true,
      deductedItems: [],
      errors: [],
    };

    try {
      // First validate that we have sufficient stock
      const validation = await this.validateOrderStock(orderItems);

      if (!validation.isValid) {
        result.success = false;
        result.errors = validation.insufficientItems.map(
          item =>
            `Insufficient ${item.item_name}: need ${item.required} ${item.unit}, have ${item.available} ${item.unit}`
        );
        return result;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        for (const warning of validation.warnings) {
          useNotificationStore.getState().addNotification({
            type: 'warning',
            title: 'Stock Warning',
            message: `${warning.item_name}: ${warning.message}`,
          });
        }
      }

      // Process each order item
      for (const orderItem of orderItems) {
        const { product, quantity } = orderItem;

        if (!product.recipe_items || !Array.isArray(product.recipe_items)) {
          continue;
        }

        // Deduct inventory for each recipe item
        for (const recipeItem of product.recipe_items as RecipeIngredient[]) {
          const totalToDeduct = recipeItem.quantity * quantity;

          try {
            await inventoryService.addStockTransaction({
              inventory_item_id: recipeItem.inventory_item_id,
              transaction_type: 'OUT',
              quantity: totalToDeduct,
              reference_type: 'ORDER',
              reference_id: orderId,
              notes: `Auto-deduction for ${product.name} (Qty: ${quantity})`,
            });

            // Get item name for reporting
            const inventoryItem = await inventoryService.getItemById(
              recipeItem.inventory_item_id
            );

            result.deductedItems.push({
              inventory_item_id: recipeItem.inventory_item_id,
              item_name: inventoryItem.name,
              quantity_deducted: totalToDeduct,
              unit: inventoryItem.unit,
            });
          } catch (error: any) {
            result.success = false;
            result.errors.push(
              `Failed to deduct ${recipeItem.inventory_item_id}: ${error.message}`
            );
          }
        }
      }

      // If there were any errors, consider the operation failed
      if (result.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Stock deduction failed: ${error.message}`);
      return result;
    }
  }

  // Calculate projected stock levels after an order
  async calculateProjectedStock(
    orderItems: Array<{
      product: Product;
      quantity: number;
    }>
  ): Promise<
    Map<string, { current: number; projected: number; item: InventoryItem }>
  > {
    const projections = new Map();

    // Get all inventory items
    const inventoryItems = await inventoryService.getAllItems({
      isActive: true,
    });
    const inventoryMap = new Map(inventoryItems.map(item => [item.id, item]));

    // Calculate total requirements
    const totalRequirements = new Map<string, number>();

    for (const orderItem of orderItems) {
      const { product, quantity } = orderItem;

      if (!product.recipe_items || !Array.isArray(product.recipe_items)) {
        continue;
      }

      for (const recipeItem of product.recipe_items as RecipeIngredient[]) {
        const totalNeeded = recipeItem.quantity * quantity;
        const currentTotal =
          totalRequirements.get(recipeItem.inventory_item_id) || 0;
        totalRequirements.set(
          recipeItem.inventory_item_id,
          currentTotal + totalNeeded
        );
      }
    }

    // Calculate projections
    for (const [inventoryId, totalRequired] of totalRequirements.entries()) {
      const item = inventoryMap.get(inventoryId);
      if (item) {
        const current = item.current_stock || 0;
        const projected = current - totalRequired;

        projections.set(inventoryId, {
          current,
          projected,
          item,
        });
      }
    }

    return projections;
  }

  // Get items that will go below minimum stock after order
  async getItemsBelowMinimumAfterOrder(
    orderItems: Array<{
      product: Product;
      quantity: number;
    }>
  ): Promise<
    Array<{
      item: InventoryItem;
      current_stock: number;
      projected_stock: number;
      minimum_stock: number;
    }>
  > {
    const projections = await this.calculateProjectedStock(orderItems);
    const itemsBelowMinimum = [];

    for (const [_, projection] of projections.entries()) {
      const { current, projected, item } = projection;
      const minimum = item.minimum_stock || 0;

      if (projected < minimum) {
        itemsBelowMinimum.push({
          item,
          current_stock: current,
          projected_stock: projected,
          minimum_stock: minimum,
        });
      }
    }

    return itemsBelowMinimum;
  }

  // Check if products are available for sale (have sufficient stock)
  async checkProductsAvailability(
    productIds: string[]
  ): Promise<Map<string, boolean>> {
    const availability = new Map<string, boolean>();

    try {
      const stockAvailability =
        await inventoryService.checkStockAvailability(productIds);

      for (const item of stockAvailability) {
        availability.set(item.product_id, item.is_available);
      }
    } catch (error) {
      console.error('Failed to check product availability:', error);
      // Default to unavailable on error
      for (const productId of productIds) {
        availability.set(productId, false);
      }
    }

    return availability;
  }

  // Get recipe cost for a product (based on ingredient costs)
  async calculateRecipeCost(product: Product): Promise<number> {
    if (!product.recipe_items || !Array.isArray(product.recipe_items)) {
      return 0;
    }

    let totalCost = 0;

    try {
      for (const recipeItem of product.recipe_items as RecipeIngredient[]) {
        const inventoryItem = await inventoryService.getItemById(
          recipeItem.inventory_item_id
        );
        if (inventoryItem && inventoryItem.cost_per_unit) {
          totalCost += inventoryItem.cost_per_unit * recipeItem.quantity;
        }
      }
    } catch (error) {
      console.error('Failed to calculate recipe cost:', error);
    }

    return totalCost;
  }

  // Estimate how many times a product can be made with current stock
  async calculateMaxProductQuantity(product: Product): Promise<number> {
    if (!product.recipe_items || !Array.isArray(product.recipe_items)) {
      return Infinity; // No recipe items means unlimited
    }

    try {
      let maxQuantity = Infinity;

      for (const recipeItem of product.recipe_items as RecipeIngredient[]) {
        const inventoryItem = await inventoryService.getItemById(
          recipeItem.inventory_item_id
        );
        if (inventoryItem) {
          const available = inventoryItem.current_stock || 0;
          const possibleQuantity = Math.floor(available / recipeItem.quantity);
          maxQuantity = Math.min(maxQuantity, possibleQuantity);
        } else {
          return 0; // Missing ingredient means can't make any
        }
      }

      return maxQuantity === Infinity ? 0 : maxQuantity;
    } catch (error) {
      console.error('Failed to calculate max product quantity:', error);
      return 0;
    }
  }

  // Generate recipe report for a product
  async generateRecipeReport(product: Product): Promise<{
    recipe_items: Array<{
      ingredient: InventoryItem;
      required_quantity: number;
      available_quantity: number;
      cost_per_unit: number;
      total_cost: number;
      sufficient: boolean;
    }>;
    total_recipe_cost: number;
    can_make_quantity: number;
    missing_ingredients: string[];
  }> {
    const report = {
      recipe_items: [] as any[],
      total_recipe_cost: 0,
      can_make_quantity: 0,
      missing_ingredients: [] as string[],
    };

    if (!product.recipe_items || !Array.isArray(product.recipe_items)) {
      return report;
    }

    let minQuantity = Infinity;

    for (const recipeItem of product.recipe_items as RecipeIngredient[]) {
      try {
        const ingredient = await inventoryService.getItemById(
          recipeItem.inventory_item_id
        );

        if (!ingredient) {
          report.missing_ingredients.push(
            `Unknown ingredient: ${recipeItem.inventory_item_id}`
          );
          minQuantity = 0;
          continue;
        }

        const available = ingredient.current_stock || 0;
        const cost = ingredient.cost_per_unit || 0;
        const totalCost = cost * recipeItem.quantity;
        const sufficient = available >= recipeItem.quantity;
        const possibleQuantity = Math.floor(available / recipeItem.quantity);

        report.recipe_items.push({
          ingredient,
          required_quantity: recipeItem.quantity,
          available_quantity: available,
          cost_per_unit: cost,
          total_cost: totalCost,
          sufficient,
        });

        report.total_recipe_cost += totalCost;
        minQuantity = Math.min(minQuantity, possibleQuantity);
      } catch (error) {
        report.missing_ingredients.push(
          `Error loading ingredient: ${recipeItem.inventory_item_id}`
        );
        minQuantity = 0;
      }
    }

    report.can_make_quantity = minQuantity === Infinity ? 0 : minQuantity;

    return report;
  }
}

// Export singleton instance
export const recipeService = new RecipeService();
