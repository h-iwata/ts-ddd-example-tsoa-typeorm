import { DomainError } from '../../../shared/errors';
import { InvalidOrderStateError } from './InvalidOrderStateError';
import { EmptyOrderError } from './EmptyOrderError';
import { InsufficientStockError } from './InsufficientStockError';
import { OrderNotFoundError } from './OrderNotFoundError';

describe('Order Errors', () => {
  describe('InvalidOrderStateError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new InvalidOrderStateError('CONFIRMED', '変更');
      expect(error.message).toBe(
        'CONFIRMED状態の注文に対して「変更」操作はできません'
      );
    });

    it('正しいエラーコードを持つ', () => {
      const error = new InvalidOrderStateError('CONFIRMED', '変更');
      expect(error.code).toBe('INVALID_ORDER_STATE');
    });

    it('DomainErrorを継承している', () => {
      const error = new InvalidOrderStateError('CONFIRMED', '変更');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('EmptyOrderError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new EmptyOrderError();
      expect(error.message).toBe('注文には少なくとも1つの商品が必要です');
    });

    it('正しいエラーコードを持つ', () => {
      const error = new EmptyOrderError();
      expect(error.code).toBe('EMPTY_ORDER');
    });

    it('DomainErrorを継承している', () => {
      const error = new EmptyOrderError();
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('InsufficientStockError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new InsufficientStockError('product-123', 10, 5);
      expect(error.message).toBe(
        '商品(product-123)の在庫が不足しています。要求数: 10、在庫数: 5'
      );
    });

    it('正しいエラーコードを持つ', () => {
      const error = new InsufficientStockError('product-123', 10, 5);
      expect(error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('DomainErrorを継承している', () => {
      const error = new InsufficientStockError('product-123', 10, 5);
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('OrderNotFoundError', () => {
    it('正しいエラーメッセージを持つ', () => {
      const error = new OrderNotFoundError('order-456');
      expect(error.message).toBe('注文が見つかりません: order-456');
    });

    it('正しいエラーコードを持つ', () => {
      const error = new OrderNotFoundError('order-456');
      expect(error.code).toBe('ORDER_NOT_FOUND');
    });

    it('DomainErrorを継承している', () => {
      const error = new OrderNotFoundError('order-456');
      expect(error).toBeInstanceOf(DomainError);
    });
  });
});
