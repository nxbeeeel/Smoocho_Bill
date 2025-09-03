import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { recipeService } from '../../services/recipeService';

interface StockWarningsProps {
  products: Product[];
  selectedItems: Array<{ product: Product; quantity: number }>;
  onProductUnavailable?: (productId: string) => void;
}

interface ProductStockStatus {
  product_id: string;
  product_name: string;
  is_available: boolean;
  max_quantity: number;
  warning_message?: string;
  insufficient_items: string[];
}

const StockWarnings: React.FC<StockWarningsProps> = ({
  products,
  selectedItems,
  onProductUnavailable,
}) => {
  const [stockStatus, setStockStatus] = useState<
    Map<string, ProductStockStatus>
  >(new Map());
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Check stock availability for all products
  const checkProductAvailability = async () => {
    if (products.length === 0) return;

    setIsChecking(true);

    try {
      const productIds = products.map(p => p.id);
      const availability =
        await recipeService.checkProductsAvailability(productIds);
      const newStatus = new Map<string, ProductStockStatus>();

      for (const product of products) {
        const isAvailable = availability.get(product.id) || false;
        const maxQuantity =
          await recipeService.calculateMaxProductQuantity(product);

        let warningMessage = '';
        const insufficientItems: string[] = [];

        if (!isAvailable) {
          // Get detailed info about insufficient ingredients
          const report = await recipeService.generateRecipeReport(product);
          const insufficientIngredients = report.recipe_items.filter(
            item => !item.sufficient
          );

          if (insufficientIngredients.length > 0) {
            insufficientItems.push(
              ...insufficientIngredients.map(item => item.ingredient.name)
            );
            warningMessage = `Insufficient ingredients: ${insufficientItems.join(', ')}`;
          } else {
            warningMessage = 'Product unavailable';
          }
        } else if (maxQuantity < 10) {
          warningMessage = `Limited stock: only ${maxQuantity} available`;
        }

        newStatus.set(product.id, {
          product_id: product.id,
          product_name: product.name,
          is_available: isAvailable,
          max_quantity: maxQuantity,
          warning_message: warningMessage,
          insufficient_items: insufficientItems,
        });
      }

      setStockStatus(newStatus);
    } catch (error) {
      console.error('Failed to check product availability:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Check for order validation
  const validateCurrentOrder = async () => {
    if (selectedItems.length === 0) return;

    try {
      const validation = await recipeService.validateOrderStock(selectedItems);

      if (!validation.isValid) {
        // Show order-level warnings
        console.warn('Order validation failed:', validation.insufficientItems);
      }
    } catch (error) {
      console.error('Failed to validate order:', error);
    }
  };

  useEffect(() => {
    checkProductAvailability();
  }, [products]);

  useEffect(() => {
    validateCurrentOrder();
  }, [selectedItems]);

  // Refresh stock status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkProductAvailability();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [products]);

  const getUnavailableProducts = () => {
    return Array.from(stockStatus.values()).filter(
      status => !status.is_available
    );
  };

  const getLowStockProducts = () => {
    return Array.from(stockStatus.values()).filter(
      status => status.is_available && status.max_quantity < 10
    );
  };

  const renderProductWarning = (status: ProductStockStatus) => {
    if (status.is_available && status.max_quantity >= 10) {
      return null;
    }

    const isUnavailable = !status.is_available;

    return (
      <div
        key={status.product_id}
        className={`p-3 rounded-lg border-2 ${
          isUnavailable
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{isUnavailable ? '🚫' : '⚠️'}</span>
            <div>
              <h4
                className={`font-medium ${
                  isUnavailable ? 'text-red-800' : 'text-yellow-800'
                }`}
              >
                {status.product_name}
              </h4>
              <p
                className={`text-sm ${
                  isUnavailable ? 'text-red-600' : 'text-yellow-600'
                }`}
              >
                {status.warning_message}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() =>
                setShowDetails(
                  showDetails === status.product_id ? null : status.product_id
                )
              }
              className={`px-2 py-1 text-xs font-medium rounded ${
                isUnavailable
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Details
            </button>

            {isUnavailable && onProductUnavailable && (
              <button
                onClick={() => onProductUnavailable(status.product_id)}
                className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Detailed Information */}
        {showDetails === status.product_id && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm space-y-2">
              <div>
                <strong>Max Available:</strong> {status.max_quantity} units
              </div>

              {status.insufficient_items.length > 0 && (
                <div>
                  <strong>Missing Ingredients:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    {status.insufficient_items.map((item, index) => (
                      <li key={index} className="text-red-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={checkProductAvailability}
                  className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const unavailableProducts = getUnavailableProducts();
  const lowStockProducts = getLowStockProducts();

  if (
    unavailableProducts.length === 0 &&
    lowStockProducts.length === 0 &&
    !isChecking
  ) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Loading Indicator */}
      {isChecking && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">
              Checking stock availability...
            </span>
          </div>
        </div>
      )}

      {/* Critical Alerts - Out of Stock */}
      {unavailableProducts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-800 flex items-center">
            <span className="mr-2">🚫</span>
            Unavailable Items ({unavailableProducts.length})
          </h3>
          {unavailableProducts.map(renderProductWarning)}
        </div>
      )}

      {/* Warning Alerts - Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-yellow-800 flex items-center">
            <span className="mr-2">⚠️</span>
            Low Stock Items ({lowStockProducts.length})
          </h3>
          {lowStockProducts.map(renderProductWarning)}
        </div>
      )}

      {/* Refresh Button */}
      <div className="pt-2 border-t border-gray-200">
        <button
          onClick={checkProductAvailability}
          disabled={isChecking}
          className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh Stock Status'}
        </button>
      </div>
    </div>
  );
};

// Helper component for individual product stock indicator
export const ProductStockIndicator: React.FC<{
  product: Product;
  size?: 'sm' | 'md' | 'lg';
}> = ({ product, size = 'sm' }) => {
  const [status, setStatus] = useState<ProductStockStatus | null>(null);

  useEffect(() => {
    const checkStock = async () => {
      try {
        const availability = await recipeService.checkProductsAvailability([
          product.id,
        ]);
        const isAvailable = availability.get(product.id) || false;
        const maxQuantity =
          await recipeService.calculateMaxProductQuantity(product);

        setStatus({
          product_id: product.id,
          product_name: product.name,
          is_available: isAvailable,
          max_quantity: maxQuantity,
          insufficient_items: [],
        });
      } catch (error) {
        console.error('Failed to check product stock:', error);
      }
    };

    checkStock();
  }, [product.id]);

  if (!status) return null;

  const getIndicatorColor = () => {
    if (!status.is_available) return 'bg-red-500';
    if (status.max_quantity < 5) return 'bg-yellow-500';
    if (status.max_quantity < 10) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${getIndicatorColor()} rounded-full`}
      title={
        !status.is_available
          ? 'Out of stock'
          : `${status.max_quantity} available`
      }
    />
  );
};

export default StockWarnings;
