import { PrismaClient } from '@prisma/client';
import { InventoryItem, StockTransaction, TransactionType, ReferenceType } from '../types';

const prisma = new PrismaClient();

export class InventoryService {
  // Get all inventory items with optional filters
  async getAllInventoryItems(filters?: {
    isActive?: boolean;
    lowStock?: boolean;
    expiringSoon?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { supplier_name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    let items = await prisma.inventoryItem.findMany({
      where,
      include: {
        stock_transactions: {
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Apply additional filters after query
    if (filters?.lowStock) {
      items = items.filter(item => 
        Number(item.current_stock) <= Number(item.minimum_stock)
      );
    }

    if (filters?.expiringSoon) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      items = items.filter(item => 
        item.expiry_date && new Date(item.expiry_date) <= nextWeek
      );
    }

    return items;
  }

  // Get single inventory item by ID
  async getInventoryItemById(id: string) {
    return await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        stock_transactions: {
          take: 20,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });
  }

  // Create new inventory item
  async createInventoryItem(data: {
    name: string;
    unit: string;
    current_stock?: number;
    minimum_stock?: number;
    cost_per_unit?: number;
    supplier_name?: string;
    supplier_contact?: string;
    expiry_date?: Date;
  }) {
    return await prisma.inventoryItem.create({
      data: {
        ...data,
        current_stock: data.current_stock || 0,
        minimum_stock: data.minimum_stock || 0
      }
    });
  }

  // Update inventory item
  async updateInventoryItem(id: string, data: Partial<InventoryItem>) {
    return await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  }

  // Delete inventory item (soft delete)
  async deleteInventoryItem(id: string) {
    return await prisma.inventoryItem.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });
  }

  // Add stock transaction
  async addStockTransaction(data: {
    inventory_item_id: string;
    transaction_type: TransactionType;
    quantity: number;
    cost_per_unit?: number;
    reference_type?: ReferenceType;
    reference_id?: string;
    notes?: string;
    user_id: string;
  }) {
    const { inventory_item_id, transaction_type, quantity } = data;

    // Start transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Create stock transaction record
      const transaction = await tx.stockTransaction.create({
        data: {
          ...data,
          total_cost: data.cost_per_unit ? data.cost_per_unit * quantity : null
        }
      });

      // Update inventory item stock level
      const currentItem = await tx.inventoryItem.findUnique({
        where: { id: inventory_item_id }
      });

      if (!currentItem) {
        throw new Error('Inventory item not found');
      }

      let newStock = Number(currentItem.current_stock);

      switch (transaction_type) {
        case 'IN':
          newStock += quantity;
          break;
        case 'OUT':
          newStock -= quantity;
          if (newStock < 0) {
            throw new Error('Insufficient stock');
          }
          break;
        case 'ADJUSTMENT':
          newStock = quantity; // For adjustments, quantity is the new total
          break;
      }

      await tx.inventoryItem.update({
        where: { id: inventory_item_id },
        data: {
          current_stock: newStock,
          last_restocked: transaction_type === 'IN' ? new Date() : currentItem.last_restocked,
          updated_at: new Date()
        }
      });

      return transaction;
    });
  }

  // Deduct stock based on recipe
  async deductStockForOrder(orderId: string, orderItems: Array<{
    product_id: string;
    quantity: number;
    recipe_items?: Array<{
      inventory_id: string;
      quantity: number;
      unit: string;
    }>;
  }>, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const transactions = [];

      for (const orderItem of orderItems) {
        if (orderItem.recipe_items && orderItem.recipe_items.length > 0) {
          for (const recipeItem of orderItem.recipe_items) {
            const totalQuantityNeeded = recipeItem.quantity * orderItem.quantity;

            // Check if sufficient stock is available
            const inventoryItem = await tx.inventoryItem.findUnique({
              where: { id: recipeItem.inventory_id }
            });

            if (!inventoryItem) {
              throw new Error(`Inventory item ${recipeItem.inventory_id} not found`);
            }

            if (Number(inventoryItem.current_stock) < totalQuantityNeeded) {
              throw new Error(
                `Insufficient stock for ${inventoryItem.name}. Required: ${totalQuantityNeeded}, Available: ${inventoryItem.current_stock}`
              );
            }

            // Create stock transaction
            const transaction = await tx.stockTransaction.create({
              data: {
                inventory_item_id: recipeItem.inventory_id,
                transaction_type: 'OUT',
                quantity: totalQuantityNeeded,
                reference_type: 'ORDER',
                reference_id: orderId,
                notes: `Auto-deduction for order ${orderId}`,
                user_id: userId
              }
            });

            // Update stock level
            await tx.inventoryItem.update({
              where: { id: recipeItem.inventory_id },
              data: {
                current_stock: Number(inventoryItem.current_stock) - totalQuantityNeeded,
                updated_at: new Date()
              }
            });

            transactions.push(transaction);
          }
        }
      }

      return transactions;
    });
  }

  // Get low stock alerts
  async getLowStockAlerts() {
    return await prisma.inventoryItem.findMany({
      where: {
        is_active: true,
        current_stock: {
          lte: prisma.inventoryItem.fields.minimum_stock
        }
      },
      orderBy: {
        current_stock: 'asc'
      }
    });
  }

  // Get expiring items
  async getExpiringItems(daysAhead: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await prisma.inventoryItem.findMany({
      where: {
        is_active: true,
        expiry_date: {
          lte: futureDate,
          gte: new Date()
        }
      },
      orderBy: {
        expiry_date: 'asc'
      }
    });
  }

  // Get stock usage report
  async getStockUsageReport(startDate: Date, endDate: Date) {
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        },
        transaction_type: 'OUT'
      },
      include: {
        inventory_item: {
          select: { id: true, name: true, unit: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Group by inventory item
    const usage = transactions.reduce((acc, transaction) => {
      const itemId = transaction.inventory_item_id;
      if (!acc[itemId]) {
        acc[itemId] = {
          inventory_item: transaction.inventory_item,
          total_used: 0,
          transaction_count: 0,
          transactions: []
        };
      }
      
      acc[itemId].total_used += Number(transaction.quantity);
      acc[itemId].transaction_count += 1;
      acc[itemId].transactions.push(transaction);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(usage);
  }

  // Get stock summary
  async getStockSummary() {
    const totalItems = await prisma.inventoryItem.count({
      where: { is_active: true }
    });

    const lowStockItems = await prisma.inventoryItem.count({
      where: {
        is_active: true,
        current_stock: {
          lte: prisma.inventoryItem.fields.minimum_stock
        }
      }
    });

    const outOfStockItems = await prisma.inventoryItem.count({
      where: {
        is_active: true,
        current_stock: { lte: 0 }
      }
    });

    const expiringItems = await this.getExpiringItems(7);

    const totalValue = await prisma.inventoryItem.aggregate({
      where: { is_active: true },
      _sum: {
        current_stock: true
      }
    });

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      expiringItemsCount: expiringItems.length,
      totalStockValue: totalValue._sum.current_stock || 0
    };
  }

  // Check stock availability for products
  async checkStockAvailability(productIds: string[]) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        is_active: true
      },
      select: {
        id: true,
        name: true,
        recipe_items: true
      }
    });

    const availability = [];

    for (const product of products) {
      let isAvailable = true;
      let insufficientItems: string[] = [];

      if (product.recipe_items && Array.isArray(product.recipe_items)) {
        for (const recipeItem of product.recipe_items as any[]) {
          const inventoryItem = await prisma.inventoryItem.findUnique({
            where: { id: recipeItem.inventory_id }
          });

          if (!inventoryItem || Number(inventoryItem.current_stock) < recipeItem.quantity) {
            isAvailable = false;
            insufficientItems.push(inventoryItem?.name || 'Unknown item');
          }
        }
      }

      availability.push({
        product_id: product.id,
        product_name: product.name,
        is_available: isAvailable,
        insufficient_items: insufficientItems
      });
    }

    return availability;
  }
}

export const inventoryService = new InventoryService();