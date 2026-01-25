import { DomainError } from '../../../shared/errors';
import { ProductNotFoundError } from './ProductNotFoundError';

describe('Product Errors', () => {
  describe('ProductNotFoundError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new ProductNotFoundError('product-123');
      expect(error.message).toBe('商品が見つかりません: product-123');
    });

    it('正しいエラーコードを持つ', () => {
      const error = new ProductNotFoundError('product-123');
      expect(error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('DomainErrorを継承している', () => {
      const error = new ProductNotFoundError('product-123');
      expect(error).toBeInstanceOf(DomainError);
    });
  });
});
