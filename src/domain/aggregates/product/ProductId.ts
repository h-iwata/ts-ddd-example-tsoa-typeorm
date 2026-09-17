import { randomUUID } from 'node:crypto';

export class ProductId {
  private constructor(private readonly value: string) {}

  static generate(): ProductId {
    return new ProductId(randomUUID());
  }

  static fromString(id: string): ProductId {
    if (!id || id.trim() === '') {
      throw new Error('商品IDは空にできません');
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
