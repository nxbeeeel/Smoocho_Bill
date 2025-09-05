# Clean Architecture Implementation

## 🏗️ Architecture Overview

This project follows **Clean Architecture** principles with **SOLID** design patterns, providing a maintainable, testable, and scalable codebase.

## 📁 Project Structure

```
src/
├── domain/                    # Core Business Logic
│   ├── entities/             # Business Entities
│   │   ├── Product.ts        # Product domain entity
│   │   ├── CartItem.ts       # Cart item entity
│   │   ├── Cart.ts           # Shopping cart entity
│   │   └── Order.ts          # Order entity
│   ├── value-objects/        # Value Objects
│   │   ├── Money.ts          # Money value object
│   │   └── Email.ts          # Email value object
│   ├── services/             # Domain Services
│   │   └── OrderCalculationService.ts
│   └── repositories/         # Repository Interfaces
│       ├── ProductRepository.ts
│       └── OrderRepository.ts
├── application/              # Application Layer
│   ├── use-cases/           # Use Cases (Business Logic)
│   │   ├── product/
│   │   ├── cart/
│   │   └── order/
│   └── services/            # Application Services
│       └── ServiceContainer.ts
├── infrastructure/          # Infrastructure Layer
│   └── repositories/        # Repository Implementations
│       ├── DexieProductRepository.ts
│       └── DexieOrderRepository.ts
└── presentation/            # Presentation Layer
    ├── hooks/               # Custom Hooks
    │   ├── useProducts.ts
    │   ├── useCart.ts
    │   └── useOrders.ts
    └── components/          # UI Components
        ├── ProductCard.tsx
        └── CartSummary.tsx
```

## 🎯 SOLID Principles Applied

### 1. **Single Responsibility Principle (SRP)**
- Each class has one reason to change
- `Product` entity only handles product-related logic
- `Cart` entity only handles cart operations
- `OrderCalculationService` only handles order calculations

### 2. **Open/Closed Principle (OCP)**
- Open for extension, closed for modification
- New payment methods can be added without changing existing code
- New product types can be added through inheritance

### 3. **Liskov Substitution Principle (LSP)**
- All repository implementations can be substituted
- Value objects maintain consistent behavior
- Entities can be replaced with their subclasses

### 4. **Interface Segregation Principle (ISP)**
- Small, focused interfaces
- `ProductRepository` only contains product-related methods
- `OrderRepository` only contains order-related methods

### 5. **Dependency Inversion Principle (DIP)**
- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Dependency injection through `ServiceContainer`

## 🔄 Data Flow

```
UI Components → Custom Hooks → Use Cases → Domain Services → Repositories → Database
```

1. **UI Components** trigger user actions
2. **Custom Hooks** manage state and call use cases
3. **Use Cases** contain business logic
4. **Domain Services** handle complex business rules
5. **Repositories** abstract data access
6. **Database** stores persistent data

## 🧩 Key Components

### Domain Layer
- **Entities**: Core business objects with behavior
- **Value Objects**: Immutable objects representing concepts
- **Services**: Business logic that doesn't belong to entities
- **Repositories**: Interfaces for data access

### Application Layer
- **Use Cases**: Application-specific business logic
- **Services**: Dependency injection and orchestration

### Infrastructure Layer
- **Repository Implementations**: Concrete data access
- **External Services**: Third-party integrations

### Presentation Layer
- **Hooks**: State management and business logic integration
- **Components**: Pure UI components

## 🚀 Benefits

1. **Maintainability**: Clear separation of concerns
2. **Testability**: Easy to unit test each layer
3. **Scalability**: Easy to add new features
4. **Flexibility**: Easy to change implementations
5. **Reusability**: Components can be reused across the app

## 📝 Usage Examples

### Adding a Product
```typescript
const { createProduct } = useProducts()
const result = await createProduct({
  name: 'New Product',
  price: 99.99,
  category: 'Electronics'
})
```

### Adding to Cart
```typescript
const { addToCart } = useCart()
const result = addToCart(product, 2)
```

### Creating an Order
```typescript
const { createOrder } = useOrders()
const result = await createOrder({
  paymentMethod: 'cash',
  orderType: 'takeaway',
  discount: 0,
  discountType: 'flat',
  taxRate: 0,
  deliveryCharge: 0
})
```

## 🔧 Clean Pages

- `/pos-clean` - Clean POS implementation
- `/products-clean` - Clean product management
- `/orders-clean` - Clean order history

These pages demonstrate the clean architecture in action with proper separation of concerns and SOLID principles.
