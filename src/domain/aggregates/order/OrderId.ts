import { randomUUID } from 'node:crypto';
import { InvalidIdError } from '../../shared/errors';

export class OrderId {
  private constructor(private readonly value: string) {}

  static generate(): OrderId {
    return new OrderId(randomUUID());
  }

  static fromString(id: string): OrderId {
    if (!id || id.trim() === '') {
      throw new InvalidIdError('注文ID');
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
