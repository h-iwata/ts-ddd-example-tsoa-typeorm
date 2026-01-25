import { DomainError } from './DomainError';

export class InvalidPriceError extends DomainError {
  readonly code = 'INVALID_PRICE';
  constructor(price: number) {
    super(`Invalid price: ${price}. Price must be positive.`);
  }
}
