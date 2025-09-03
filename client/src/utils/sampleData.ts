import { offlineStorage } from '../services/offlineStorageService';
import { Category } from '../types';
import { smoochoProducts } from './smoochoMenuData';

// Sample categories
const sampleCategories: Omit<Category, 'created_at' | 'updated_at'>[] = [
  {
    id: 'cat-1',
    name: 'Kunafa Bowls',
    description: 'Introducing Kunafa - Premium dessert bowls',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Smoocho Signatures',
    description: 'Signature dessert creations',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-3',
    name: 'Crispy Rice Tubs',
    description: 'Crispy rice desserts with premium toppings',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-4',
    name: 'Choco Desserts',
    description: 'Chocolate-based desserts and treats',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cat-5',
    name: 'Fruits Choco Mix',
    description: 'Farm fresh fruits mixed with premium chocolates',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'cat-6',
    name: 'Ice Creams',
    description: 'Premium ice cream scoops',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'cat-7',
    name: 'Beverages',
    description: 'Refreshing drinks and beverages',
    sort_order: 7,
    is_active: true,
  },
  {
    id: 'cat-8',
    name: 'Add-ons',
    description: 'Additional toppings and extras',
    sort_order: 8,
    is_active: true,
  },
];

// Sample products - Using Smoocho Menu Items
const sampleProducts = smoochoProducts;

// Function to seed sample data
export const seedSampleData = async (): Promise<void> => {
  try {
    console.log('🌱 Starting sample data seeding...');

    // Add timestamps to categories
    const categoriesWithTimestamps = sampleCategories.map(category => ({
      ...category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Add timestamps to products
    const productsWithTimestamps = sampleProducts.map(product => ({
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log(`📄 Seeding ${categoriesWithTimestamps.length} categories...`);
    // Sync categories (clears existing and adds new)
    await offlineStorage.syncCategories(categoriesWithTimestamps);
    console.log(`✅ Added ${categoriesWithTimestamps.length} categories`);

    console.log(`🗺 Seeding ${productsWithTimestamps.length} products...`);
    // Sync products (clears existing and adds new)
    await offlineStorage.syncProducts(productsWithTimestamps);
    console.log(`✅ Added ${productsWithTimestamps.length} products`);

    console.log('🎉 Sample data seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed sample data:', error);
    throw error;
  }
};

// Function to check if data exists
export const checkSampleDataExists = async (): Promise<boolean> => {
  try {
    // Get all categories and products
    const [categories, products] = await Promise.all([
      offlineStorage.getAllCategories(), // Remove the false parameter
      offlineStorage.getAllProducts()
    ]);

    return categories.length > 0 && products.length > 0;
  } catch (error) {
    console.error('Failed to check sample data:', error);
    return false;
  }
};

// Auto-seed if no data exists
export const autoSeedIfEmpty = async (): Promise<void> => {
  try {
    console.log('📂 Checking for existing data...');

    // Get all categories and products
    const [categories, products] = await Promise.all([
      offlineStorage.getAllCategories(), // Remove the false parameter
      offlineStorage.getAllProducts()
    ]);

    const dataExists = categories.length > 0 && products.length > 0;
    console.log('📂 Data exists check:', {
      categoryCount: categories.length,
      productCount: products.length,
      dataExists,
    });

    if (!dataExists) {
      console.log('📂 No sample data found, auto-seeding...');
      await seedSampleData();
    } else {
      console.log('📋 Sample data already exists - skipping seed');
    }
  } catch (error) {
    console.error('Auto-seed failed:', error);
    throw error; // Re-throw to handle in caller
  }
};
