/**
 * Money Value Object - Enterprise Grade
 * Immutable value object representing monetary amounts with business rules
 * 
 * @author Enterprise Architecture Team
 * @version 1.0.0
 * @since 2024
 */

export interface CurrencyCode {
  readonly value: string
}

export interface Amount {
  readonly value: number
}

export interface MoneyValueObjectProps {
  readonly amount: Amount
  readonly currency: CurrencyCode
}

/**
 * Money Value Object - Immutable monetary representation
 * Contains all business rules for monetary operations
 */
export class MoneyValueObject {
  private readonly _amount: Amount
  private readonly _currency: CurrencyCode

  constructor(props: MoneyValueObjectProps) {
    this._amount = props.amount
    this._currency = props.currency
    this.validateInvariants()
  }

  /**
   * Business Rule: Amount must be non-negative
   */
  private validateInvariants(): void {
    if (this._amount.value < 0) {
      throw new Error('Money amount cannot be negative')
    }

    if (!this._currency.value || this._currency.value.length !== 3) {
      throw new Error('Currency code must be 3 characters long')
    }
  }

  /**
   * Get amount value
   */
  public getAmount(): number {
    return this._amount.value
  }

  /**
   * Get currency code
   */
  public getCurrency(): string {
    return this._currency.value
  }

  /**
   * Business Logic: Add money (same currency only)
   */
  public add(other: MoneyValueObject): MoneyValueObject {
    this.validateSameCurrency(other)
    return new MoneyValueObject({
      amount: { value: this._amount.value + other._amount.value },
      currency: this._currency
    })
  }

  /**
   * Business Logic: Subtract money (same currency only)
   */
  public subtract(other: MoneyValueObject): MoneyValueObject {
    this.validateSameCurrency(other)
    const result = this._amount.value - other._amount.value
    if (result < 0) {
      throw new Error('Subtraction would result in negative amount')
    }
    return new MoneyValueObject({
      amount: { value: result },
      currency: this._currency
    })
  }

  /**
   * Business Logic: Multiply by factor
   */
  public multiply(factor: number): MoneyValueObject {
    if (factor < 0) {
      throw new Error('Multiplication factor cannot be negative')
    }
    return new MoneyValueObject({
      amount: { value: this._amount.value * factor },
      currency: this._currency
    })
  }

  /**
   * Business Logic: Divide by divisor
   */
  public divide(divisor: number): MoneyValueObject {
    if (divisor <= 0) {
      throw new Error('Division divisor must be positive')
    }
    return new MoneyValueObject({
      amount: { value: this._amount.value / divisor },
      currency: this._currency
    })
  }

  /**
   * Business Logic: Check if greater than other
   */
  public isGreaterThan(other: MoneyValueObject): boolean {
    this.validateSameCurrency(other)
    return this._amount.value > other._amount.value
  }

  /**
   * Business Logic: Check if less than other
   */
  public isLessThan(other: MoneyValueObject): boolean {
    this.validateSameCurrency(other)
    return this._amount.value < other._amount.value
  }

  /**
   * Business Logic: Check if equal to other
   */
  public equals(other: MoneyValueObject): boolean {
    return this._amount.value === other._amount.value && 
           this._currency.value === other._currency.value
  }

  /**
   * Business Logic: Format for display
   */
  public format(): string {
    const symbol = this.getCurrencySymbol()
    return `${symbol}${this._amount.value.toFixed(2)}`
  }

  /**
   * Business Logic: Get currency symbol
   */
  private getCurrencySymbol(): string {
    switch (this._currency.value) {
      case 'INR': return '₹'
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'GBP': return '£'
      default: return this._currency.value
    }
  }

  /**
   * Business Logic: Validate same currency
   */
  private validateSameCurrency(other: MoneyValueObject): void {
    if (this._currency.value !== other._currency.value) {
      throw new Error('Cannot perform operation on different currencies')
    }
  }

  /**
   * Factory Method: Create INR money
   */
  public static createINR(amount: number): MoneyValueObject {
    return new MoneyValueObject({
      amount: { value: amount },
      currency: { value: 'INR' }
    })
  }

  /**
   * Factory Method: Create USD money
   */
  public static createUSD(amount: number): MoneyValueObject {
    return new MoneyValueObject({
      amount: { value: amount },
      currency: { value: 'USD' }
    })
  }

  /**
   * Factory Method: Create zero money
   */
  public static zero(currency: string = 'INR'): MoneyValueObject {
    return new MoneyValueObject({
      amount: { value: 0 },
      currency: { value: currency }
    })
  }
}
