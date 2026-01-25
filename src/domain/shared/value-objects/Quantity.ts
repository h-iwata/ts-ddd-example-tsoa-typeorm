import { InvalidQuantityError } from '../errors';

/**
 * 数量を表す値オブジェクト
 */
export class Quantity {
  private constructor(private readonly value: number) {}

  static create(value: number): Quantity {
    if (!Number.isInteger(value) || value < 0) {
      throw new InvalidQuantityError(value);
    }
    return new Quantity(value);
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  getValue(): number {
    return this.value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result < 0) {
      throw new InvalidQuantityError(result);
    }
    return new Quantity(result);
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isGreaterThanOrEqual(other: Quantity): boolean {
    return this.value >= other.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
