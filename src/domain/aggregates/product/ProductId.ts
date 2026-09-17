import { randomUUID } from 'node:crypto';
import { InvalidIdError } from '../../shared/errors';

export class ProductId {
  private constructor(private readonly value: string) {}

  static generate(): ProductId {
    return new ProductId(randomUUID());
  }

  static fromString(id: string): ProductId {
    if (!id || id.trim() === '') {
      throw new InvalidIdError('商品ID');
    }
    return new ProductId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
