import { DomainError } from './DomainError';

export class InvalidQuantityError extends DomainError {
  readonly code = 'INVALID_QUANTITY';
  constructor(quantity: number) {
    super(`Invalid quantity: ${quantity}. Quantity must be positive.`);
  }
}
