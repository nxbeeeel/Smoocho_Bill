import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { PlusIcon, MinusIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

const POSMenu: React.FC = () => {
  const { addItem, getItemCountById, removeItemById } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use responsive hook
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Sample menu data - replace with real data later
  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'starters', name: 'Starters', icon: '🥗' },
    { id: 'main', name: 'Main Course', icon: '🍖' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
  ];

  const menuItems = [
    {
      id: '1',
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with tender chicken and aromatic spices',
      price: 299,
      category: 'main',
      image: 'https://images.unsplash.com/photo-1563379091339-3b21d0c1b5e9?w=400&h=300&fit=crop',
      preparation_time: 15,
      is_vegetarian: false,
      is_available: true
    },
    {
      id: '2',
      name: 'Paneer Tikka',
      description: 'Grilled cottage cheese with Indian spices',
      price: 199,
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      preparation_time: 10,
      is_vegetarian: true,
      is_available: true
    },
    {
      id: '3',
      name: 'Gulab Jamun',
      description: 'Sweet milk solids in sugar syrup',
      price: 89,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      preparation_time: 5,
      is_vegetarian: true,
      is_available: true
    },
    {
      id: '4',
      name: 'Masala Chai',
      description: 'Spiced Indian tea with milk',
      price: 49,
      category: 'beverages',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
      preparation_time: 3,
      is_vegetarian: true,
      is_available: true
    },
    {
      id: '5',
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken',
      price: 349,
      category: 'main',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      preparation_time: 20,
      is_vegetarian: false,
      is_available: true
    },
    {
      id: '6',
      name: 'Samosa',
      description: 'Crispy pastry with spiced potato filling',
      price: 79,
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
      preparation_time: 8,
      is_vegetarian: true,
      is_available: true
    }
  ];

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      product,
      quantity: 1,
      item_total: product.price
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.is_available;
  });

  // FIXED: Prevent horizontal scrolling with proper grid columns
  const getGridCols = () => {
    if (isMobile) return 'grid-cols-1';
    if (isTablet) return 'grid-cols-2'; // Fixed: Only 2 columns on tablet to prevent overflow
    if (isDesktop) return 'grid-cols-3 xl:grid-cols-4';
    return 'grid-cols-1';
  };

  // FIXED: Optimized spacing that won't cause overflow
  const getSpacing = () => {
    if (isMobile) return 'gap-3';
    if (isTablet) return 'gap-3'; // Fixed: Reduced spacing to prevent overflow
    if (isDesktop) return 'gap-6';
    return 'gap-3';
  };

  // FIXED: Optimized padding that fits within viewport
  const getPadding = () => {
    if (isMobile) return 'p-3';
    if (isTablet) return 'p-3'; // Fixed: Reduced padding to prevent overflow
    if (isDesktop) return 'p-6';
    return 'p-3';
  };

  // FIXED: Container width that prevents horizontal scrolling
  const getContainerWidth = () => {
    if (isMobile) return 'w-full px-2'; // Fixed: Full width with minimal padding
    if (isTablet) return 'w-full px-3'; // Fixed: Full width with minimal padding
    if (isDesktop) return 'max-w-7xl mx-auto px-6';
    return 'w-full px-3';
  };

  // FIXED: Header sizing that fits within viewport
  const getHeaderSize = () => {
    if (isMobile) return 'mb-4';
    if (isTablet) return 'mb-4'; // Fixed: Reduced margin to prevent overflow
    if (isDesktop) return 'mb-8';
    return 'mb-4';
  };

  return (
    <div className={`${getContainerWidth()} overflow-hidden`}>
      {/* FIXED Header Section - No horizontal overflow */}
      <div className={getHeaderSize()}>
        <h1 className={`font-bold text-gray-900 mb-2 ${
          isMobile ? 'text-xl' : isTablet ? 'text-xl' : 'text-3xl'
        }`}>
          Menu
        </h1>
        <p className={`text-gray-600 ${
          isMobile ? 'text-sm' : isTablet ? 'text-sm' : 'text-base'
        }`}>
          Select items to add to your order
        </p>
      </div>

      {/* FIXED Search and Filters - No horizontal overflow */}
      <div className={`mb-4 space-y-3 ${isMobile ? 'mb-3 space-y-2' : isTablet ? 'mb-4 space-y-3' : 'mb-6 space-y-4'}`}>
        {/* FIXED Search Bar - Fits within viewport */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              isMobile 
                ? 'py-2 text-sm' 
                : isTablet 
                  ? 'py-2.5 text-sm' 
                  : 'py-3 text-base'
            }`}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* FIXED Category Filters - Horizontal scroll only if needed */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${
                isMobile 
                  ? 'px-3 py-1.5 text-xs' 
                  : isTablet 
                    ? 'px-3 py-1.5 text-xs' 
                    : 'px-4 py-2 text-sm'
              }`}
            >
              <span className="text-sm">
                {category.icon}
              </span>
              <span className="text-xs">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FIXED Menu Grid - No horizontal overflow */}
      <div className={`grid ${getGridCols()} ${getSpacing()} w-full`}>
        {filteredItems.map((product) => {
          const itemCount = getItemCountById(product.id);
          const isInCart = itemCount > 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group w-full"
            >
              {/* FIXED Product Image - Fits within card */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* FIXED Cart Count Badge - Proper positioning */}
                {isInCart && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute z-10 top-2 left-2"
                  >
                    <div className="bg-primary-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white w-5 h-5 text-xs">
                      {itemCount}
                    </div>
                  </motion.div>
                )}

                {/* FIXED Product Badges - Compact and visible */}
                <div className="absolute flex flex-col gap-1 top-2 right-2">
                  {/* Vegetarian badge removed since property doesn't exist */}
                  <div className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs">
                    <ClockIcon className="w-3 h-3" />
                    <span>{product.preparation_time}m</span>
                  </div>
                </div>

                {/* FIXED Quick Action Buttons - Only on larger screens */}
                {!isMobile && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      {isInCart && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItemById(product.id, 1);
                          }}
                          className="bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg w-10 h-10"
                        >
                          <MinusIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg w-10 h-10"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FIXED Product Info - Compact and readable */}
              <div className={getPadding()}>
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 text-xs">
                    {product.description}
                  </p>
                </div>

                {/* FIXED Price and Add Button - Compact layout */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="text-green-600 w-4 h-4" />
                    <span className="font-bold text-gray-900 text-base">
                      ₹{product.price}
                    </span>
                  </div>

                  {/* FIXED Add Button - Compact and touch-friendly */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`rounded-lg font-medium text-xs transition-all duration-200 flex items-center space-x-1 ${
                      isInCart
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                        : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-md'
                    } px-3 py-1.5`}
                  >
                    {isInCart ? (
                      <>
                        <PlusIcon className="w-3 h-3" />
                        <span>+1</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-3 h-3" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FIXED Empty State - No horizontal overflow */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto text-gray-400 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 mb-2 text-base">
            No items found
          </h3>
          <p className="text-gray-600 text-sm">
            Try adjusting your search or category filters
          </p>
        </div>
      )}
    </div>
  );
};

export default POSMenu;
