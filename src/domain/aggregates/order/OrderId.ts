import { randomUUID } from 'node:crypto';

/**
 * 注文IDを表す値オブジェクト
 */
export class OrderId {
  private constructor(private readonly value: string) {}

  static generate(): OrderId {
    return new OrderId(randomUUID());
  }

  static fromString(id: string): OrderId {
    if (!id || id.trim() === '') {
      throw new Error('注文IDは空にできません');
    }
    return new OrderId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
