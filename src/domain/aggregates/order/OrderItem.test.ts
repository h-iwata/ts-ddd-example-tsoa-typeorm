import { Money, Quantity } from '../../shared/value-objects';
import { ProductId } from '../product/ProductId';
import { OrderItem } from './OrderItem';
import { OrderItemId } from './OrderItemId';

describe('OrderItem', () => {
  const productId = () => ProductId.fromString('product-1');
  const createItem = (price = 1000, qty = 2) =>
    OrderItem.create(productId(), 'テスト商品', Money.create(price, 'JPY'), Quantity.create(qty));

  describe('.create', () => {
    it('新しい注文明細を作成する', () => {
      const item = createItem();
      expect(item.getId()).toBeDefined();
      expect(item.getProductId().getValue()).toBe('product-1');
      expect(item.getProductName()).toBe('テスト商品');
      expect(item.getUnitPrice().getAmount()).toBe(1000);
      expect(item.getQuantity().getValue()).toBe(2);
    });
  });

  describe('.reconstruct', () => {
    it('既存の注文明細を再構築する', () => {
      const item = OrderItem.reconstruct(
        OrderItemId.fromString('item-1'),
        productId(),
        'テスト商品',
        Money.create(1000, 'JPY'),
        Quantity.create(3)
      );
      expect(item.getId().getValue()).toBe('item-1');
      expect(item.getProductId().getValue()).toBe('product-1');
      expect(item.getQuantity().getValue()).toBe(3);
    });
  });

  describe('#getSubtotal', () => {
    it('小計を計算する', () => {
      expect(createItem(1000, 3).getSubtotal().getAmount()).toBe(3000);
    });

    context('when 数量1', () => {
      it('単価と同じ', () => {
        expect(createItem(500, 1).getSubtotal().getAmount()).toBe(500);
      });
    });
  });

  describe('#withQuantity', () => {
    it('数量を変えた新しい明細を返す', () => {
      const changed = createItem(1000, 2).withQuantity(Quantity.create(5));
      expect(changed.getQuantity().getValue()).toBe(5);
      expect(changed.getSubtotal().getAmount()).toBe(5000);
    });

    it('同じ明細として扱えるようIDを引き継ぐ', () => {
      const item = createItem(1000, 2);
      expect(item.withQuantity(Quantity.create(5)).getId().getValue()).toBe(item.getId().getValue());
    });

    it('元の明細は変わらない', () => {
      const item = createItem(1000, 2);
      item.withQuantity(Quantity.create(5));
      expect(item.getQuantity().getValue()).toBe(2);
    });
  });
});
