import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { smoochoProducts } from '../../utils/smoochoMenuData';

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  allergens?: string[];
  preparationTime?: number;
  calories?: number;
}

interface PastOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  orderDate: Date;
  status: 'completed' | 'cancelled' | 'pending';
  paymentMethod: string;
  tableNumber?: string;
}

const MenuEditor: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PastOrder | null>(null);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week'>('today');

  // Initialize with actual Smoocho menu data
  useEffect(() => {
    // Extract categories from the actual menu data
    const uniqueCategories = Array.from(new Set(smoochoProducts.map(item => item.category_id)));
    const menuCategories: MenuCategory[] = uniqueCategories.map((catId, index) => ({
      id: catId,
      name: getCategoryName(catId),
      description: getCategoryDescription(catId),
      isActive: true,
      sortOrder: index + 1
    }));

    // Convert Smoocho products to MenuItem format
    const menuItems: MenuItem[] = smoochoProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.category_id,
      isAvailable: product.is_available,
      isVegetarian: false, // Default value since property doesn't exist
      isSpicy: false, // Default value since property doesn't exist
      preparationTime: product.preparation_time || 10,
      calories: 0 // Default value since property doesn't exist
    }));

    // Sample past orders
    const sampleOrders: PastOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        items: [
          { name: 'Hazelnut Kunafa', quantity: 2, price: 219 },
          { name: 'Chocolate Mousse Cup', quantity: 1, price: 129 }
        ],
        total: 567,
        orderDate: new Date(),
        status: 'completed',
        paymentMethod: 'Cash',
        tableNumber: 'T1'
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        items: [
          { name: 'Pista Kunafa', quantity: 1, price: 249 },
          { name: 'Vanilla Scoop', quantity: 2, price: 89 }
        ],
        total: 427,
        orderDate: new Date(Date.now() - 86400000), // Yesterday
        status: 'completed',
        paymentMethod: 'Card',
        tableNumber: 'T3'
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        customerName: 'Mike Johnson',
        items: [
          { name: 'White Chocolate Kunafa', quantity: 1, price: 219 },
          { name: 'Fresh Orange Juice', quantity: 2, price: 99 }
        ],
        total: 417,
        orderDate: new Date(Date.now() - 172800000), // 2 days ago
        status: 'completed',
        paymentMethod: 'UPI',
        tableNumber: 'T2'
      }
    ];

    setCategories(menuCategories);
    setItems(menuItems);
    setPastOrders(sampleOrders);
    
    if (menuCategories.length > 0) {
      setSelectedCategory(menuCategories[0].id);
    }
  }, []);

  // Helper functions to get category names and descriptions
  const getCategoryName = (catId: string): string => {
    const categoryNames: { [key: string]: string } = {
      'cat-1': 'Kunafa Bowls',
      'cat-2': 'Chocolate Delights', 
      'cat-3': 'Fruits Choco Mix',
      'cat-4': 'Ice Creams',
      'cat-5': 'Beverages',
      'cat-6': 'Add-ons'
    };
    return categoryNames[catId] || 'Unknown Category';
  };

  const getCategoryDescription = (catId: string): string => {
    const categoryDescriptions: { [key: string]: string } = {
      'cat-1': 'Premium kunafa desserts with various toppings',
      'cat-2': 'Rich chocolate desserts and mousses',
      'cat-3': 'Fresh fruits paired with premium chocolate',
      'cat-4': 'Premium ice cream varieties',
      'cat-5': 'Refreshing beverages and drinks',
      'cat-6': 'Additional toppings and extras'
    };
    return categoryDescriptions[catId] || 'Delicious items';
  };

  const addCategory = (category: Omit<MenuCategory, 'id'>) => {
    const newCategory: MenuCategory = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    setCategories([...categories, newCategory]);
    setShowCategoryForm(false);
  };

  const updateCategory = (id: string, updates: Partial<MenuCategory>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    setEditingCategory(null);
  };

  const deleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
      setItems(items.filter(item => item.categoryId !== id));
      if (selectedCategory === id) {
        setSelectedCategory(categories[0]?.id || '');
      }
    }
  };

  const addItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `prod-${Date.now()}`,
    };
    setItems([...items, newItem]);
    setShowItemForm(false);
  };

  const updateItem = (id: string, updates: Partial<MenuItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const filteredItems = items.filter(item => 
    item.categoryId === selectedCategory &&
    (searchTerm === '' || 
     item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // Filter orders by date
  const getFilteredOrders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    switch (dateFilter) {
      case 'today':
        return pastOrders.filter(order => order.orderDate >= today);
      case 'yesterday':
        return pastOrders.filter(order => 
          order.orderDate >= yesterday && order.orderDate < today
        );
      case 'week':
        return pastOrders.filter(order => order.orderDate >= weekAgo);
      default:
        return pastOrders;
    }
  };

  const handleReprint = (order: PastOrder) => {
    // Implement print functionality
    console.log('Reprinting order:', order.orderNumber);
    alert(`Reprinting order ${order.orderNumber}`);
  };

  const handleEditOrder = (order: PastOrder) => {
    setSelectedOrder(order);
    // You can implement order editing logic here
  };

  const handleDuplicateOrder = (order: PastOrder) => {
    const newOrder: PastOrder = {
      ...order,
      id: `ORD-${Date.now()}`,
      orderNumber: `ORD-${Date.now()}`,
      orderDate: new Date(),
      status: 'pending'
    };
    setPastOrders([newOrder, ...pastOrders]);
    alert(`Order duplicated as ${newOrder.orderNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past Orders
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'menu' ? (
            /* Menu Management Tab */
            <div className="space-y-6">
              {/* Menu Editor Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Menu Management</h2>
                  <p className="text-gray-600">Manage your menu categories, items, and pricing</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCategoryForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Category
                  </button>
                  <button 
                    onClick={() => setShowItemForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={!selectedCategory}
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Menu Editor Content */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Categories Panel */}
                <div className="xl:col-span-1">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                    </div>
                    <div className="p-4 space-y-2">
                      {categories.map(category => (
                        <div 
                          key={category.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedCategory === category.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">{category.name}</h3>
                              {category.description && (
                                <p className="text-sm text-gray-600">{category.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategory(category);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(category.id);
                                }}
                                className="p-1 text-red-400 hover:text-red-600 rounded"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items Panel */}
                <div className="xl:col-span-3">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {currentCategory ? currentCategory.name : 'Select Category'}
                          </h2>
                          {currentCategory && (
                            <p className="text-sm text-gray-600">
                              {filteredItems.length} items
                            </p>
                          )}
                        </div>
                        {currentCategory && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Search items..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      {currentCategory ? (
                        <div className="space-y-4">
                          {filteredItems.map(item => (
                            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                                    <span className="text-lg font-bold text-primary-600">
                                      ₹{item.price}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="text-gray-600 mb-2">{item.description}</p>
                                  )}
                                  <div className="flex gap-2 flex-wrap">
                                    {item.isVegetarian && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        Vegetarian
                                      </span>
                                    )}
                                    {item.isSpicy && (
                                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                        Spicy
                                      </span>
                                    )}
                                    {item.preparationTime && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {item.preparationTime} min
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteItem(item.id)}
                                    className="p-2 text-red-400 hover:text-red-600 rounded hover:bg-red-100"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Select a category to view and manage items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Past Orders Tab */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Past Orders</h1>
                  <p className="text-gray-600">View and manage completed orders</p>
                </div>
                <div className="flex gap-3">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as 'today' | 'yesterday' | 'week')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {dateFilter === 'today' ? "Today's Orders" : 
                     dateFilter === 'yesterday' ? "Yesterday's Orders" : "This Week's Orders"}
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {getFilteredOrders().map(order => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">{order.orderNumber}</h3>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {order.status}
                              </span>
                              {order.tableNumber && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {order.tableNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2 text-gray-600">
                              <UserIcon className="w-4 h-4" />
                              <span>{order.customerName}</span>
                              <CreditCardIcon className="w-4 h-4 ml-2" />
                              <span>{order.paymentMethod}</span>
                            </div>
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-lg">Total: ₹{order.total}</span>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  {order.orderDate.toLocaleDateString()} at {order.orderDate.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="p-2 text-blue-400 hover:text-blue-600 rounded hover:bg-blue-100"
                              title="Edit Order"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReprint(order)}
                              className="p-2 text-green-400 hover:text-green-600 rounded hover:bg-green-100"
                              title="Reprint Receipt"
                            >
                              <PrinterIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateOrder(order)}
                              className="p-2 text-purple-400 hover:text-purple-600 rounded hover:bg-purple-100"
                              title="Duplicate Order"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getFilteredOrders().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No orders found for the selected period
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          onSubmit={addCategory}
          onCancel={() => setShowCategoryForm(false)}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSubmit={(updates) => updateCategory(editingCategory.id, updates)}
          onCancel={() => setEditingCategory(null)}
          isEditing
        />
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemForm
          categories={categories}
          onSubmit={addItem}
          onCancel={() => setShowItemForm(false)}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <ItemForm
          item={editingItem}
          categories={categories}
          onSubmit={(updates) => updateItem(editingItem.id, updates)}
          onCancel={() => setEditingItem(null)}
          isEditing
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onReprint={() => handleReprint(selectedOrder)}
          onDuplicate={() => handleDuplicateOrder(selectedOrder)}
        />
      )}
    </div>
  );
};

// Category Form Component
interface CategoryFormProps {
  category?: MenuCategory;
  onSubmit: (category: Omit<MenuCategory, 'id'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  category, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4"
                />
                Active
              </label>
              <div>
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                  className="form-input w-20"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                {isEditing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Item Form Component
interface ItemFormProps {
  item?: MenuItem;
  categories: MenuCategory[];
  onSubmit: (item: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ 
  item, 
  categories, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    categoryId: item?.categoryId || categories[0]?.id || '',
    image: item?.image || '',
    isAvailable: item?.isAvailable ?? true,
    isVegetarian: item?.isVegetarian ?? false,
    isSpicy: item?.isSpicy ?? false,
    preparationTime: item?.preparationTime || 0,
    calories: item?.calories || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="form-select"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Preparation Time (min)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({...formData, preparationTime: parseInt(e.target.value)})}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Calories</label>
                <input
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value)})}
                  className="form-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  className="w-4 h-4"
                />
                Available
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({...formData, isVegetarian: e.target.checked})}
                  className="w-4 h-4"
                />
                Vegetarian
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSpicy}
                  onChange={(e) => setFormData({...formData, isSpicy: e.target.checked})}
                  className="w-4 h-4"
                />
                Spicy
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                {isEditing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Order Details Modal
interface OrderDetailsModalProps {
  order: PastOrder;
  onClose: () => void;
  onReprint: () => void;
  onDuplicate: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onReprint,
  onDuplicate
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><span className="font-semibold">Order Number:</span> {order.orderNumber}</p>
              <p><span className="font-semibold">Customer:</span> {order.customerName}</p>
              <p><span className="font-semibold">Payment Method:</span> {order.paymentMethod}</p>
              {order.tableNumber && <p><span className="font-semibold">Table:</span> {order.tableNumber}</p>}
            </div>
            <div>
              <p><span className="font-semibold">Status:</span> {order.status}</p>
              <p><span className="font-semibold">Total:</span> ₹{order.total}</p>
              <p><span className="font-semibold">Date:</span> {order.orderDate.toLocaleDateString()} at {order.orderDate.toLocaleTimeString()}</p>
            </div>
          </div>

          <h4 className="text-md font-semibold mb-3">Items:</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onReprint} className="btn btn-primary">Reprint Receipt</button>
            <button onClick={onDuplicate} className="btn btn-secondary">Duplicate Order</button>
            <button onClick={onClose} className="btn btn-danger">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;
