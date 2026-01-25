import { v4 as uuidv4 } from 'uuid';

/**
 * 商品IDを表す値オブジェクト
 */
export class ProductId {
  private constructor(private readonly value: string) {}

  static generate(): ProductId {
    return new ProductId(uuidv4());
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
