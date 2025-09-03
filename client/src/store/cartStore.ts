import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
  preparation_time?: number;
  is_vegetarian?: boolean;
  is_available?: boolean;
  image?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  item_total: number;
  special_instructions?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  discount_amount: number;
  discount_type?: 'percentage' | 'fixed';
}

export interface CartStore extends Cart {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
  getItemCount: () => number;
  getItemCountById: (productId: string) => number;
  removeItemById: (productId: string, quantity: number) => void;
  total: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      discount_amount: 0,
      discount_type: 'percentage',
      total: {
        subtotal: 0,
        tax: 0,
        total: 0
      },

      addItem: (newItem: CartItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item => item.product.id === newItem.product.id
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity: item.quantity + newItem.quantity,
                  item_total: (item.quantity + newItem.quantity) * item.product.price,
                }
              : item
          );
          set({ items: updatedItems });
        } else {
          // Add new item
          set({ items: [...items, newItem] });
        }

        get().calculateTotals();
      },

      removeItem: (productId: string) => {
        const { items } = get();
        const filteredItems = items.filter(item => item.product.id !== productId);
        set({ items: filteredItems });
        get().calculateTotals();
      },

      updateQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = items.map(item =>
          item.product.id === productId
            ? {
                ...item,
                quantity,
                item_total: quantity * item.product.price,
              }
            : item
        );
        set({ items: updatedItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          discount_amount: 0,
          total: {
            subtotal: 0,
            tax: 0,
            total: 0
          }
        });
      },

      calculateTotals: () => {
        const { items, discount_amount, discount_type } = get();
        const subtotal = items.reduce((sum, item) => sum + item.item_total, 0);
        
        let finalSubtotal = subtotal;
        if (discount_amount > 0) {
          if (discount_type === 'percentage') {
            finalSubtotal = subtotal * (1 - discount_amount / 100);
          } else {
            finalSubtotal = Math.max(0, subtotal - discount_amount);
          }
        }
        
        const tax = finalSubtotal * 0.05; // 5% tax
        const total = finalSubtotal + tax;

        set({
          subtotal: finalSubtotal,
          tax_amount: tax,
          total_amount: total,
          total: {
            subtotal: finalSubtotal,
            tax: tax,
            total: total
          }
        });
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItemCountById: (productId: string) => {
        const { items } = get();
        const item = items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
      },

      removeItemById: (productId: string, quantity: number = 1) => {
        const { items } = get();
        const itemIndex = items.findIndex(item => item.product.id === productId);
        
        if (itemIndex >= 0) {
          const item = items[itemIndex];
          if (item.quantity <= quantity) {
            // Remove entire item
            const newItems = items.filter((_, index) => index !== itemIndex);
            set({ items: newItems });
          } else {
            // Reduce quantity
            const newItems = items.map((item, index) =>
              index === itemIndex
                ? {
                    ...item,
                    quantity: item.quantity - quantity,
                    item_total: (item.quantity - quantity) * item.product.price,
                  }
                : item
            );
            set({ items: newItems });
          }
          get().calculateTotals();
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
