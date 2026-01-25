import { Money, Quantity } from '../../shared/value-objects';
import { InsufficientStockError } from '../order/errors';
import { Product } from './Product';
import { ProductId } from './ProductId';

describe('Product', () => {
  const createProduct = (stock = 10) =>
    Product.create('テスト商品', '説明', Money.create(1000), Quantity.create(stock));

  describe('#create', () => {
    it('商品を作成する', () => {
      const product = createProduct();
      expect(product.getName()).toBe('テスト商品');
      expect(product.getPrice().getAmount()).toBe(1000);
      expect(product.getStock().getValue()).toBe(10);
    });
  });

  describe('#reconstruct', () => {
    it('全属性を復元する', () => {
      const product = Product.reconstruct(
        ProductId.fromString('id-1'), 'テスト', '説明',
        Money.create(1000), Quantity.create(10), new Date(), new Date()
      );
      expect(product.getId().getValue()).toBe('id-1');
    });
  });

  describe('#hasStock', () => {
    context('when 在庫十分', () => {
      it('trueを返す', () => {
        expect(createProduct(10).hasStock(Quantity.create(5))).toBe(true);
      });
    });

    context('when 在庫不足', () => {
      it('falseを返す', () => {
        expect(createProduct(5).hasStock(Quantity.create(10))).toBe(false);
      });
    });
  });

  describe('#decreaseStock', () => {
    it('在庫を減らす', () => {
      const product = createProduct(10);
      product.decreaseStock(Quantity.create(3));
      expect(product.getStock().getValue()).toBe(7);
    });

    context('when 在庫不足', () => {
      it('エラーを投げる', () => {
        expect(() => { createProduct(5).decreaseStock(Quantity.create(10)); })
          .toThrow(InsufficientStockError);
      });
    });
  });

  describe('#increaseStock', () => {
    it('在庫を増やす', () => {
      const product = createProduct(10);
      product.increaseStock(Quantity.create(5));
      expect(product.getStock().getValue()).toBe(15);
    });
  });

  describe('#updatePrice', () => {
    it('価格を更新する', () => {
      const product = createProduct();
      product.updatePrice(Money.create(2000));
      expect(product.getPrice().getAmount()).toBe(2000);
    });
  });

  describe('#updateInfo', () => {
    it('名前と説明を更新する', () => {
      const product = createProduct();
      product.updateInfo('新商品', '新説明');
      expect(product.getName()).toBe('新商品');
      expect(product.getDescription()).toBe('新説明');
    });
  });
});
