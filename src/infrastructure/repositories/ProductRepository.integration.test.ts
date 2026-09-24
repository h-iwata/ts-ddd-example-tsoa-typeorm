import { Product, ProductId } from '../../domain/aggregates/product';
import { Money, Quantity } from '../../domain/shared/value-objects';
import { newProductFactory } from '../../test/factories';
import { ProductRepository } from './ProductRepository';

describe('ProductRepository Integration', () => {
  const repository = new ProductRepository();

  describe('#save と #findById', () => {
    it('商品を保存して取得できる', async () => {
      const product = newProductFactory.build();
      await repository.save(product);

      const found = await repository.findById(product.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(product.getId().getValue());
      expect(found!.getName()).toBe(product.getName());
      expect(found!.getDescription()).toBe(product.getDescription());
      expect(found!.getPrice().getAmount()).toBe(1000);
      expect(found!.getStock().getValue()).toBe(10);
    });

    context('when 存在しないID', () => {
      it('nullを返す', async () => {
        const found = await repository.findById(ProductId.fromString('non-existent'));
        expect(found).toBeNull();
      });
    });
  });

  describe('#findByIds', () => {
    it('複数の商品をIDで取得できる', async () => {
      const product1 = newProductFactory.build({}, { transient: { price: 100 } });
      const product2 = newProductFactory.build({}, { transient: { price: 200 } });
      const product3 = newProductFactory.build({}, { transient: { price: 300 } });
      await repository.save(product1);
      await repository.save(product2);
      await repository.save(product3);

      const found = await repository.findByIds([product1.getId(), product3.getId()]);

      expect(found).toHaveLength(2);
      const ids = found.map((p) => p.getId().getValue());
      expect(ids).toContain(product1.getId().getValue());
      expect(ids).toContain(product3.getId().getValue());
    });

    context('when 空配列', () => {
      it('空配列を返す', async () => {
        const found = await repository.findByIds([]);
        expect(found).toHaveLength(0);
      });
    });
  });

  describe('#findAll', () => {
    it('全商品を取得できる', async () => {
      await repository.save(newProductFactory.build());
      await repository.save(newProductFactory.build());

      const all = await repository.findAll();

      expect(all).toHaveLength(2);
    });

    context('when 商品なし', () => {
      it('空配列を返す', async () => {
        const all = await repository.findAll();
        expect(all).toHaveLength(0);
      });
    });
  });

  describe('#delete', () => {
    it('商品を削除できる', async () => {
      const product = newProductFactory.build();
      await repository.save(product);

      await repository.delete(product.getId());

      const found = await repository.findById(product.getId());
      expect(found).toBeNull();
    });
  });

  describe('更新', () => {
    it('既存の商品を更新できる', async () => {
      const product = newProductFactory.build();
      await repository.save(product);

      const stockBefore = product.getStock().getValue();
      product.increaseStock(Quantity.create(89));
      await repository.save(product);

      const found = await repository.findById(product.getId());
      expect(found!.getStock().getValue()).toBe(stockBefore + 89);
    });
  });

  describe('#add', () => {
    it('新規の商品を追加できる', async () => {
      const product = newProductFactory.build();
      await repository.add(product);

      const found = await repository.findById(product.getId());
      expect(found!.getName()).toBe(product.getName());
    });

    context('同じIDの商品が既に存在するとき', () => {
      it('例外を投げ、既存データを上書きしない', async () => {
        const existing = newProductFactory.build();
        await repository.add(existing);

        const conflicting = Product.reconstruct({
          id: existing.getId(),
          name: '上書きしようとする商品',
          description: '',
          price: Money.create(99999),
          stock: Quantity.create(999),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(repository.add(conflicting)).rejects.toThrow();

        const found = await repository.findById(existing.getId());
        expect(found!.getName()).toBe(existing.getName());
        expect(found!.getPrice().getAmount()).toBe(existing.getPrice().getAmount());
      });
    });
  });
});
