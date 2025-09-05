export class ProductId {
  constructor(public readonly value: number) {}
}

export class ProductName {
  constructor(public readonly value: string) {}
}

export class ProductPrice {
  constructor(public readonly value: number) {}
}

export class ProductCategory {
  constructor(public readonly value: string) {}
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
