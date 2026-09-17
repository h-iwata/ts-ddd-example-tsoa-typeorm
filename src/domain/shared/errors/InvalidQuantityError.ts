import { ValidationError } from './base';

export class InvalidQuantityError extends ValidationError {
  readonly code = 'INVALID_QUANTITY';
  constructor(quantity: number) {
    super(`無効な数量です: ${quantity}。数量は1以上である必要があります。`);
  }
}
