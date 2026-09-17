import { NotFoundError } from '../../../shared/errors';

export class OrderItemNotFoundError extends NotFoundError {
  readonly code = 'ORDER_ITEM_NOT_FOUND';
  constructor(productId: string) {
    super(`注文内に商品が見つかりません: ${productId}`);
  }
}
