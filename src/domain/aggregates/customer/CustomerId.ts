import { randomUUID } from 'node:crypto';

export class CustomerId {
  private constructor(private readonly value: string) {}

  static generate(): CustomerId {
    return new CustomerId(randomUUID());
  }

  static fromString(id: string): CustomerId {
    if (!id || id.trim() === '') {
      throw new Error('顧客IDは空にできません');
    }
    return new CustomerId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
