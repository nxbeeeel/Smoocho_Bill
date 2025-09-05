export interface ProductId {
  value: number
}

export interface ProductName {
  value: string
}

export interface ProductPrice {
  value: number
}

export interface ProductCategory {
  value: string
}

export class Product {
  constructor(
    public readonly id: ProductId,
    public readonly name: ProductName,
    public readonly price: ProductPrice,
    public readonly category: ProductCategory,
    public readonly description: string,
    public readonly isActive: boolean,
    public readonly imageUrl?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Business logic methods
  isAvailable(): boolean {
    return this.isActive
  }

  hasImage(): boolean {
    return !!this.imageUrl
  }

  updatePrice(newPrice: ProductPrice): Product {
    return new Product(
      this.id,
      this.name,
      newPrice,
      this.category,
      this.description,
      this.isActive,
      this.imageUrl,
      this.createdAt,
      new Date()
    )
  }

  toggleStatus(): Product {
    return new Product(
      this.id,
      this.name,
      this.price,
      this.category,
      this.description,
      !this.isActive,
      this.imageUrl,
      this.createdAt,
      new Date()
    )
  }
}
