import { InvalidPriceError } from '../errors';

/**
 * 金額を表す値オブジェクト
 * 通貨と金額を不変として扱う
 */
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string = 'JPY'): Money {
    if (amount < 0) {
      throw new InvalidPriceError(amount);
    }
    return new Money(amount, currency);
  }

  static zero(currency: string = 'JPY'): Money {
    return new Money(0, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new InvalidPriceError(result);
    }
    return new Money(result, this.currency);
  }

  multiply(quantity: number): Money {
    if (quantity < 0) {
      throw new InvalidPriceError(quantity);
    }
    return new Money(this.amount * quantity, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`
      );
    }
  }

  toString(): string {
    return `${this.currency} ${this.amount.toLocaleString()}`;
  }
}
