export class Money {
  constructor(private readonly amount: number, private readonly currency: string = 'INR') {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative')
    }
  }

  getValue(): number {
    return this.amount
  }

  getCurrency(): string {
    return this.currency
  }

  add(other: Money): Money {
    this.validateSameCurrency(other)
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    this.validateSameCurrency(other)
    return new Money(this.amount - other.amount, this.currency)
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency)
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero')
    }
    return new Money(this.amount / divisor, this.currency)
  }

  isGreaterThan(other: Money): boolean {
    this.validateSameCurrency(other)
    return this.amount > other.amount
  }

  isLessThan(other: Money): boolean {
    this.validateSameCurrency(other)
    return this.amount < other.amount
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  format(): string {
    return `₹${this.amount.toFixed(2)}`
  }

  private validateSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Cannot perform operation on different currencies')
    }
  }
}
