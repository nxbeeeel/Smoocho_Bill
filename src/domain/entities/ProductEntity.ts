/**
 * Product Entity - Core Business Object
 * Represents a product in the system with business rules and invariants
 * 
 * @author Enterprise Architecture Team
 * @version 1.0.0
 * @since 2024
 */

export interface ProductId {
  readonly value: number
}

export interface ProductName {
  readonly value: string
}

export interface ProductPrice {
  readonly value: number
}

export interface ProductCategory {
  readonly value: string
}

export interface ProductDescription {
  readonly value: string
}

export interface ProductImageUrl {
  readonly value: string | null
}

export interface ProductStatus {
  readonly isActive: boolean
}

export interface ProductTimestamps {
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Product Entity - Immutable business object
 * Contains all business rules and invariants for products
 */
export class ProductEntity {
  constructor(
    public readonly id: ProductId,
    public readonly name: ProductName,
    public readonly price: ProductPrice,
    public readonly category: ProductCategory,
    public readonly description: ProductDescription,
    public readonly status: ProductStatus,
    public readonly imageUrl: ProductImageUrl,
    public readonly timestamps: ProductTimestamps
  ) {
    this.validateInvariants()
  }

  /**
   * Business Rule: Product must have valid name
   */
  private validateInvariants(): void {
    if (!this.name.value || this.name.value.trim().length === 0) {
      throw new Error('Product name is required and cannot be empty')
    }

    if (this.price.value <= 0) {
      throw new Error('Product price must be greater than zero')
    }

    if (!this.category.value || this.category.value.trim().length === 0) {
      throw new Error('Product category is required')
    }
  }

  /**
   * Business Logic: Check if product is available for sale
   */
  public isAvailableForSale(): boolean {
    return this.status.isActive
  }

  /**
   * Business Logic: Check if product has image
   */
  public hasProductImage(): boolean {
    return this.imageUrl.value !== null && this.imageUrl.value.trim().length > 0
  }

  /**
   * Business Logic: Update product price with validation
   */
  public updatePrice(newPrice: ProductPrice): ProductEntity {
    if (newPrice.value <= 0) {
      throw new Error('Product price must be greater than zero')
    }

    return new ProductEntity(
      this.id,
      this.name,
      newPrice,
      this.category,
      this.description,
      this.status,
      this.imageUrl,
      {
        ...this.timestamps,
        updatedAt: new Date()
      }
    )
  }

  /**
   * Business Logic: Toggle product status
   */
  public toggleStatus(): ProductEntity {
    return new ProductEntity(
      this.id,
      this.name,
      this.price,
      this.category,
      this.description,
      { isActive: !this.status.isActive },
      this.imageUrl,
      {
        ...this.timestamps,
        updatedAt: new Date()
      }
    )
  }

  /**
   * Business Logic: Update product information
   */
  public updateInformation(
    name: ProductName,
    category: ProductCategory,
    description: ProductDescription
  ): ProductEntity {
    return new ProductEntity(
      this.id,
      name,
      this.price,
      category,
      description,
      this.status,
      this.imageUrl,
      {
        ...this.timestamps,
        updatedAt: new Date()
      }
    )
  }

  /**
   * Business Logic: Update product image
   */
  public updateImage(imageUrl: ProductImageUrl): ProductEntity {
    return new ProductEntity(
      this.id,
      this.name,
      this.price,
      this.category,
      this.description,
      this.status,
      imageUrl,
      {
        ...this.timestamps,
        updatedAt: new Date()
      }
    )
  }

  /**
   * Factory Method: Create new product
   */
  public static create(
    name: ProductName,
    price: ProductPrice,
    category: ProductCategory,
    description: ProductDescription,
    imageUrl: ProductImageUrl = { value: null }
  ): ProductEntity {
    const now = new Date()
    return new ProductEntity(
      { value: 0 }, // Will be set by repository
      name,
      price,
      category,
      description,
      { isActive: true },
      imageUrl,
      {
        createdAt: now,
        updatedAt: now
      }
    )
  }
}
