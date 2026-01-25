import { DomainError } from '../../../shared/errors';
import { EmptyOrderError } from './EmptyOrderError';
import { InsufficientStockError } from './InsufficientStockError';
import { InvalidOrderStateError } from './InvalidOrderStateError';
import { OrderNotFoundError } from './OrderNotFoundError';

describe('Order Errors', () => {
  describe('InvalidOrderStateError', () => {
    const error = () => new InvalidOrderStateError('CONFIRMED', '変更');

    it('正しいメッセージとコードを持つ', () => {
      expect(error().message).toBe('CONFIRMED状態の注文に対して「変更」操作はできません');
      expect(error().code).toBe('INVALID_ORDER_STATE');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
    });
  });

  describe('EmptyOrderError', () => {
    const error = () => new EmptyOrderError();

    it('正しいメッセージとコードを持つ', () => {
      expect(error().message).toBe('注文には少なくとも1つの商品が必要です');
      expect(error().code).toBe('EMPTY_ORDER');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
    });
  });

  describe('InsufficientStockError', () => {
    const error = () => new InsufficientStockError('product-123', 10, 5);

    it('正しいメッセージとコードを持つ', () => {
      expect(error().message).toBe('商品(product-123)の在庫が不足しています。要求数: 10、在庫数: 5');
      expect(error().code).toBe('INSUFFICIENT_STOCK');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
    });
  });

  describe('OrderNotFoundError', () => {
    const error = () => new OrderNotFoundError('order-456');

    it('正しいメッセージとコードを持つ', () => {
      expect(error().message).toBe('注文が見つかりません: order-456');
      expect(error().code).toBe('ORDER_NOT_FOUND');
    });

    it('DomainErrorを継承している', () => {
      expect(error()).toBeInstanceOf(DomainError);
    });
  });
});
