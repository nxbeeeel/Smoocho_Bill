import { inventoryService, InventoryItem } from './inventoryService';

export interface RecipeIngredient {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

export interface MenuRecipe {
  menuItemId: string;
  menuItemName: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  preparationTime: number;
  category: string;
}

export interface StockConsumption {
  inventoryItemId: string;
  quantityConsumed: number;
  remainingStock: number;
  lowStockAlert: boolean;
}

export class RecipeService {
  // Mock recipe database - in production, this would come from a real database
  private recipes: Map<string, MenuRecipe> = new Map([
    ['prod-1', {
      menuItemId: 'prod-1',
      menuItemName: 'Hazelnut Kunafa',
      ingredients: [
        { inventoryItemId: 'inv-1', inventoryItemName: 'Milk', quantity: 0.5, unit: 'liters', costPerUnit: 2.5 },
        { inventoryItemId: 'inv-2', inventoryItemName: 'Sugar', quantity: 0.2, unit: 'kg', costPerUnit: 1.2 }
      ],
      totalCost: 1.49,
      preparationTime: 15,
      category: 'Desserts'
    }],
    ['prod-2', {
      menuItemId: 'prod-2',
      menuItemName: 'Pista Coffee Earthquake',
      ingredients: [
        { inventoryItemId: 'inv-1', inventoryItemName: 'Milk', quantity: 0.3, unit: 'liters', costPerUnit: 2.5 },
        { inventoryItemId: 'inv-2', inventoryItemName: 'Sugar', quantity: 0.1, unit: 'kg', costPerUnit: 1.2 }
      ],
      totalCost: 0.87,
      preparationTime: 12,
      category: 'Coffee'
    }],
    ['prod-3', {
      menuItemId: 'prod-3',
      menuItemName: 'Classic Kunafa',
      ingredients: [
        { inventoryItemId: 'inv-1', inventoryItemName: 'Milk', quantity: 0.4, unit: 'liters', costPerUnit: 2.5 },
        { inventoryItemId: 'inv-2', inventoryItemName: 'Sugar', quantity: 0.15, unit: 'kg', costPerUnit: 1.2 }
      ],
      totalCost: 1.18,
      preparationTime: 18,
      category: 'Desserts'
    }]
  ]);

  // Get recipe for a menu item
  async getRecipe(menuItemId: string): Promise<MenuRecipe | null> {
    return this.recipes.get(menuItemId) || null;
  }

  // Get all recipes
  async getAllRecipes(): Promise<MenuRecipe[]> {
    return Array.from(this.recipes.values());
  }

  // Check if we have enough ingredients to make a menu item
  async checkIngredientsAvailability(menuItemId: string, quantity: number = 1): Promise<{
    canMake: boolean;
    missingIngredients: string[];
    availableQuantity: number;
  }> {
    const recipe = await this.getRecipe(menuItemId);
    if (!recipe) {
      return { canMake: false, missingIngredients: ['Recipe not found'], availableQuantity: 0 };
    }

    const missingIngredients: string[] = [];
    let maxAvailableQuantity = Infinity;

    for (const ingredient of recipe.ingredients) {
      const inventoryItem = await inventoryService.getInventoryItemById(ingredient.inventoryItemId);
      if (!inventoryItem) {
        missingIngredients.push(`${ingredient.inventoryItemName} (not in inventory)`);
        continue;
      }

      const requiredQuantity = ingredient.quantity * quantity;
      if (inventoryItem.current_stock < requiredQuantity) {
        missingIngredients.push(`${ingredient.inventoryItemName} (need ${requiredQuantity} ${ingredient.unit}, have ${inventoryItem.current_stock} ${ingredient.unit})`);
      } else {
        const possibleQuantity = Math.floor(inventoryItem.current_stock / ingredient.quantity);
        maxAvailableQuantity = Math.min(maxAvailableQuantity, possibleQuantity);
      }
    }

    return {
      canMake: missingIngredients.length === 0,
      missingIngredients,
      availableQuantity: maxAvailableQuantity
    };
  }

  // Consume ingredients when a menu item is sold
  async consumeIngredients(menuItemId: string, quantity: number = 1): Promise<{
    success: boolean;
    consumedItems: StockConsumption[];
    errors: string[];
  }> {
    const recipe = await this.getRecipe(menuItemId);
    if (!recipe) {
      return { success: false, consumedItems: [], errors: ['Recipe not found'] };
    }

    const consumedItems: StockConsumption[] = [];
    const errors: string[] = [];

    for (const ingredient of recipe.ingredients) {
      try {
        const inventoryItem = await inventoryService.getInventoryItemById(ingredient.inventoryItemId);
        if (!inventoryItem) {
          errors.push(`${ingredient.inventoryItemName} not found in inventory`);
          continue;
        }

        const quantityToConsume = ingredient.quantity * quantity;
        if (inventoryItem.current_stock < quantityToConsume) {
          errors.push(`Insufficient stock for ${ingredient.inventoryItemName}`);
          continue;
        }

        // Update inventory stock
        const updatedItem = await inventoryService.updateInventoryItem(ingredient.inventoryItemId, {
          current_stock: inventoryItem.current_stock - quantityToConsume
        });

        // Add stock transaction record
        await inventoryService.addStockTransaction({
          inventory_item_id: ingredient.inventoryItemId,
          transaction_type: 'OUT',
          quantity: quantityToConsume,
          cost_per_unit: ingredient.costPerUnit,
          reference_type: 'ORDER',
          reference_id: `order-${Date.now()}`,
          notes: `Consumed for ${recipe.menuItemName} (${quantity} units)`,
          user_id: 'system'
        });

        consumedItems.push({
          inventoryItemId: ingredient.inventoryItemId,
          quantityConsumed: quantityToConsume,
          remainingStock: updatedItem.current_stock,
          lowStockAlert: updatedItem.current_stock <= updatedItem.minimum_stock
        });

      } catch (error) {
        errors.push(`Error processing ${ingredient.inventoryItemName}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      consumedItems,
      errors
    };
  }

  // Get low stock alerts for all recipes
  async getLowStockAlerts(): Promise<{
    critical: Array<{ menuItem: string; ingredient: string; currentStock: number; minimumStock: number }>;
    warning: Array<{ menuItem: string; ingredient: string; currentStock: number; minimumStock: number }>;
  }> {
    const critical: Array<{ menuItem: string; ingredient: string; currentStock: number; minimumStock: number }> = [];
    const warning: Array<{ menuItem: string; ingredient: string; currentStock: number; minimumStock: number }> = [];

    for (const recipe of this.recipes.values()) {
      for (const ingredient of recipe.ingredients) {
        const inventoryItem = await inventoryService.getInventoryItemById(ingredient.inventoryItemId);
        if (inventoryItem) {
          const stockRatio = inventoryItem.current_stock / inventoryItem.minimum_stock;
          
          if (stockRatio <= 0.5) {
            critical.push({
              menuItem: recipe.menuItemName,
              ingredient: ingredient.inventoryItemName,
              currentStock: inventoryItem.current_stock,
              minimumStock: inventoryItem.minimum_stock
            });
          } else if (stockRatio <= 1.0) {
            warning.push({
              menuItem: recipe.menuItemName,
              ingredient: ingredient.inventoryItemName,
              currentStock: inventoryItem.current_stock,
              minimumStock: inventoryItem.minimum_stock
            });
          }
        }
      }
    }

    return { critical, warning };
  }

  // Get cost analysis for menu items
  async getCostAnalysis(menuItemId: string): Promise<{
    menuItem: string;
    ingredients: Array<{ name: string; cost: number; percentage: number }>;
    totalCost: number;
    suggestedPrice: number;
    profitMargin: number;
  } | null> {
    const recipe = await this.getRecipe(menuItemId);
    if (!recipe) return null;

    const ingredients = recipe.ingredients.map(ingredient => ({
      name: ingredient.inventoryItemName,
      cost: ingredient.quantity * ingredient.costPerUnit,
      percentage: 0
    }));

    const totalCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0);
    
    // Calculate percentage for each ingredient
    ingredients.forEach(ing => {
      ing.percentage = (ing.cost / totalCost) * 100;
    });

    // Suggested price with 70% profit margin
    const suggestedPrice = totalCost * 1.7;
    const profitMargin = ((suggestedPrice - totalCost) / suggestedPrice) * 100;

    return {
      menuItem: recipe.menuItemName,
      ingredients,
      totalCost,
      suggestedPrice,
      profitMargin
    };
  }

  // Add new recipe
  async addRecipe(recipe: Omit<MenuRecipe, 'menuItemId'>): Promise<MenuRecipe> {
    const newRecipe: MenuRecipe = {
      ...recipe,
      menuItemId: `recipe-${Date.now()}`
    };
    
    this.recipes.set(newRecipe.menuItemId, newRecipe);
    return newRecipe;
  }

  // Update existing recipe
  async updateRecipe(menuItemId: string, updates: Partial<MenuRecipe>): Promise<MenuRecipe | null> {
    const recipe = this.recipes.get(menuItemId);
    if (!recipe) return null;

    const updatedRecipe = { ...recipe, ...updates };
    this.recipes.set(menuItemId, updatedRecipe);
    return updatedRecipe;
  }

  // Delete recipe
  async deleteRecipe(menuItemId: string): Promise<boolean> {
    return this.recipes.delete(menuItemId);
  }
}

export const recipeService = new RecipeService();
