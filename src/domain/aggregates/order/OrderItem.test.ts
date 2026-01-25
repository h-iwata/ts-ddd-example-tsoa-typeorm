import { OrderItem } from './OrderItem';
import { OrderItemId } from './OrderItemId';
import { ProductId } from '../product/ProductId';
import { Money, Quantity } from '../../shared/value-objects';

describe('OrderItem', () => {
  describe('create', () => {
    it('新しい注文明細を作成できる', () => {
      const productId = ProductId.fromString('product-1');
      const item = OrderItem.create(
        productId,
        'テスト商品',
        Money.create(1000, 'JPY'),
        Quantity.create(2)
      );

      expect(item.getId()).toBeDefined();
      expect(item.getProductId().getValue()).toBe('product-1');
      expect(item.getProductName()).toBe('テスト商品');
      expect(item.getUnitPrice().getAmount()).toBe(1000);
      expect(item.getQuantity().getValue()).toBe(2);
    });
  });

  describe('reconstruct', () => {
    it('既存の注文明細を再構築できる', () => {
      const itemId = OrderItemId.fromString('item-1');
      const productId = ProductId.fromString('product-1');

      const item = OrderItem.reconstruct(
        itemId,
        productId,
        'テスト商品',
        Money.create(1000, 'JPY'),
        Quantity.create(3)
      );

      expect(item.getId().getValue()).toBe('item-1');
      expect(item.getProductId().getValue()).toBe('product-1');
      expect(item.getQuantity().getValue()).toBe(3);
    });
  });

  describe('getSubtotal', () => {
    it('小計を正しく計算できる', () => {
      const productId = ProductId.fromString('product-1');
      const item = OrderItem.create(
        productId,
        'テスト商品',
        Money.create(1000, 'JPY'),
        Quantity.create(3)
      );

      expect(item.getSubtotal().getAmount()).toBe(3000);
    });

    it('数量1の場合は単価と同じ', () => {
      const productId = ProductId.fromString('product-1');
      const item = OrderItem.create(
        productId,
        'テスト商品',
        Money.create(500, 'JPY'),
        Quantity.create(1)
      );

      expect(item.getSubtotal().getAmount()).toBe(500);
    });
  });

  describe('changeQuantity', () => {
    it('数量を変更できる', () => {
      const productId = ProductId.fromString('product-1');
      const item = OrderItem.create(
        productId,
        'テスト商品',
        Money.create(1000, 'JPY'),
        Quantity.create(2)
      );

      item.changeQuantity(Quantity.create(5));

      expect(item.getQuantity().getValue()).toBe(5);
      expect(item.getSubtotal().getAmount()).toBe(5000);
    });
  });
});
