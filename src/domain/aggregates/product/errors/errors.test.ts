import { DomainError } from '../../../shared/errors';
import { ProductNotFoundError } from './ProductNotFoundError';

describe('Product Errors', () => {
  describe('ProductNotFoundError', () => {
    const error = () => new ProductNotFoundError('product-123');

    it('正しいメッセージとコードを持つ', () => {
      expect(error().message).toBe('商品が見つかりません: product-123');
      expect(error().code).toBe('PRODUCT_NOT_FOUND');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
    });
  });
});
