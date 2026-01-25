import { DomainError } from './DomainError';

export class InvalidPriceError extends DomainError {
  readonly code = 'INVALID_PRICE';
  constructor(price: number) {
    super(`無効な価格です: ${price}。価格は0以上である必要があります。`);
  }
}
