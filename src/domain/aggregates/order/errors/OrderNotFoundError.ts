import { NotFoundError } from '../../../shared/errors';

export class OrderNotFoundError extends NotFoundError {
  readonly code = 'ORDER_NOT_FOUND';
  constructor(orderId: string) {
    super(`注文が見つかりません: ${orderId}`);
  }
}
