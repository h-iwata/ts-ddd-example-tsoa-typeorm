import { Product } from './Product';
import { ProductId } from './ProductId';
import { Money, Quantity } from '../../shared/value-objects';
import { InsufficientStockError } from '../order/errors';

describe('Product', () => {
  describe('create', () => {
    it('新しい商品を作成できる', () => {
      const product = Product.create(
        'テスト商品',
        '商品の説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10)
      );

      expect(product.getName()).toBe('テスト商品');
      expect(product.getDescription()).toBe('商品の説明');
      expect(product.getPrice().getAmount()).toBe(1000);
      expect(product.getStock().getValue()).toBe(10);
      expect(product.getId()).toBeDefined();
      expect(product.getCreatedAt()).toBeInstanceOf(Date);
      expect(product.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('reconstruct', () => {
    it('既存の商品を再構築できる', () => {
      const id = ProductId.fromString('test-id');
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const product = Product.reconstruct(
        id,
        'テスト商品',
        '商品の説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10),
        createdAt,
        updatedAt
      );

      expect(product.getId().getValue()).toBe('test-id');
      expect(product.getName()).toBe('テスト商品');
      expect(product.getCreatedAt()).toBe(createdAt);
      expect(product.getUpdatedAt()).toBe(updatedAt);
    });
  });

  describe('hasStock', () => {
    it('十分な在庫がある場合 true', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10)
      );
      expect(product.hasStock(Quantity.create(5))).toBe(true);
    });

    it('在庫が等しい場合 true', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10)
      );
      expect(product.hasStock(Quantity.create(10))).toBe(true);
    });

    it('在庫が不足している場合 false', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(5)
      );
      expect(product.hasStock(Quantity.create(10))).toBe(false);
    });
  });

  describe('decreaseStock', () => {
    it('在庫を減らせる', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10)
      );
      const originalUpdatedAt = product.getUpdatedAt();

      // 少し待って更新日時が変わることを確認
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      product.decreaseStock(Quantity.create(3));

      expect(product.getStock().getValue()).toBe(7);
      jest.useRealTimers();
    });

    it('在庫不足の場合エラー', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(5)
      );

      expect(() => product.decreaseStock(Quantity.create(10))).toThrow(
        InsufficientStockError
      );
    });
  });

  describe('increaseStock', () => {
    it('在庫を増やせる', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10)
      );

      product.increaseStock(Quantity.create(5));

      expect(product.getStock().getValue()).toBe(15);
    });
  });

  describe('updatePrice', () => {
    it('価格を更新できる', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10)
      );

      product.updatePrice(Money.create(2000, 'JPY'));

      expect(product.getPrice().getAmount()).toBe(2000);
    });
  });

  describe('updateInfo', () => {
    it('商品情報を更新できる', () => {
      const product = Product.create(
        'テスト商品',
        '説明',
        Money.create(1000, 'JPY'),
        Quantity.create(10)
      );

      product.updateInfo('新しい商品名', '新しい説明');

      expect(product.getName()).toBe('新しい商品名');
      expect(product.getDescription()).toBe('新しい説明');
    });
  });
});
