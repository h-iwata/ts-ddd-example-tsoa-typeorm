import { randomUUID } from 'node:crypto';
import { InvalidIdError } from '../../shared/errors';

export class OrderItemId {
  private constructor(private readonly value: string) {}

  static generate(): OrderItemId {
    return new OrderItemId(randomUUID());
  }

  static fromString(id: string): OrderItemId {
    if (!id || id.trim() === '') {
      throw new InvalidIdError('注文明細ID');
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
