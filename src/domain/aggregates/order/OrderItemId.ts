import { v4 as uuidv4 } from 'uuid';

/**
 * 注文明細IDを表す値オブジェクト
 */
export class OrderItemId {
  private constructor(private readonly value: string) {}

  static generate(): OrderItemId {
    return new OrderItemId(uuidv4());
  }

  static fromString(id: string): OrderItemId {
    if (!id || id.trim() === '') {
      throw new Error('注文明細IDは空にできません');
    }
    return new OrderItemId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: OrderItemId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
