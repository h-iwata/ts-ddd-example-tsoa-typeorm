import { ValidationError } from './base';

export class InvalidPriceError extends ValidationError {
  readonly code = 'INVALID_PRICE';
  constructor(price: number) {
    super(`無効な価格です: ${price}。価格は0以上である必要があります。`);
  }
}
