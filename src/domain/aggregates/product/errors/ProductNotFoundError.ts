import { NotFoundError } from '../../../shared/errors';

export class ProductNotFoundError extends NotFoundError {
  readonly code = 'PRODUCT_NOT_FOUND';
  constructor(productId: string) {
    super(`商品が見つかりません: ${productId}`);
  }
}
