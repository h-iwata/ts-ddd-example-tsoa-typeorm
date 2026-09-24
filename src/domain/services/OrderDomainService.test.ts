import { CustomerId } from '../aggregates/customer/CustomerId';
import { Order } from '../aggregates/order';
import { InsufficientStockError } from '../aggregates/order/errors';
import { Product } from '../aggregates/product';
import { ProductNotFoundError } from '../aggregates/product/errors';
import { ProductId } from '../aggregates/product/ProductId';
import { type IProductRepository } from '../repositories';
import { Address, Money, Quantity } from '../shared/value-objects';
import { OrderDomainService } from './OrderDomainService';

describe('OrderDomainService', () => {
  const mockRepo = (): jest.Mocked<IProductRepository> => ({
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByIdsForUpdate: jest.fn(),
    findAll: jest.fn(),
    add: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  const createProduct = (id: string, stock: number) => {
    const now = new Date();
    return Product.reconstruct({
      id: ProductId.fromString(id),
      name: 'テスト商品',
      description: '説明',
      price: Money.create(1000),
      stock: Quantity.create(stock),
      createdAt: now,
      updatedAt: now,
    });
  };

  const createOrder = () => {
    const order = Order.create(CustomerId.fromString('customer-1'));
    order.addItem(ProductId.fromString('product-1'), '商品1', Money.create(1000), Quantity.create(2));
    order.setShippingAddress(Address.create('100-0001', '東京都', '千代田区', '1-1-1'));
    return order;
  };

  describe('#validateAndReserveStock', () => {
    it('在庫が十分な場合は成功する', async () => {
      const repo = mockRepo();
      const product = createProduct('product-1', 10);
      repo.findByIdsForUpdate.mockResolvedValue([product]);

      await new OrderDomainService(repo).validateAndReserveStock(createOrder());

      expect(product.getStock().getValue()).toBe(8);
      expect(repo.save).toHaveBeenCalled();
    });

    context('when 商品が見つからない', () => {
      it('エラーを投げる', async () => {
        const repo = mockRepo();
        repo.findByIdsForUpdate.mockResolvedValue([]);

        await expect(new OrderDomainService(repo).validateAndReserveStock(createOrder())).rejects.toThrow(ProductNotFoundError);
      });
    });

    context('when 在庫不足', () => {
      it('エラーを投げる', async () => {
        const repo = mockRepo();
        repo.findByIdsForUpdate.mockResolvedValue([createProduct('product-1', 1)]);

        await expect(new OrderDomainService(repo).validateAndReserveStock(createOrder())).rejects.toThrow(InsufficientStockError);
      });
    });

    context('with 複数商品', () => {
      it('それぞれの在庫を減らす', async () => {
        const repo = mockRepo();
        const order = Order.create(CustomerId.fromString('customer-1'));
        order.addItem(ProductId.fromString('product-1'), '商品1', Money.create(1000), Quantity.create(2));
        order.addItem(ProductId.fromString('product-2'), '商品2', Money.create(500), Quantity.create(3));
        order.setShippingAddress(Address.create('100-0001', '東京都', '千代田区', '1-1-1'));

        const product1 = createProduct('product-1', 10);
        const product2 = createProduct('product-2', 10);
        repo.findByIdsForUpdate.mockResolvedValue([product1, product2]);

        await new OrderDomainService(repo).validateAndReserveStock(order);

        expect(product1.getStock().getValue()).toBe(8);
        expect(product2.getStock().getValue()).toBe(7);
        expect(repo.save).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('#releaseStock', () => {
    it('在庫を戻す', async () => {
      const repo = mockRepo();
      const product = createProduct('product-1', 5);
      repo.findById.mockResolvedValue(product);

      await new OrderDomainService(repo).releaseStock(createOrder());

      expect(product.getStock().getValue()).toBe(7);
      expect(repo.save).toHaveBeenCalled();
    });

    context('when 商品が見つからない', () => {
      it('エラーにならない', async () => {
        const repo = mockRepo();
        repo.findById.mockResolvedValue(null);

        await expect(new OrderDomainService(repo).releaseStock(createOrder())).resolves.not.toThrow();
      });
    });
  });

  describe('#checkStockAvailability', () => {
    const productId = () => ProductId.fromString('product-1');

    it('在庫が十分な場合 true', async () => {
      const repo = mockRepo();
      repo.findById.mockResolvedValue(createProduct('product-1', 10));

      const result = await new OrderDomainService(repo).checkStockAvailability(productId(), Quantity.create(5));

      expect(result).toBe(true);
    });

    context('when 在庫不足', () => {
      it('falseを返す', async () => {
        const repo = mockRepo();
        repo.findById.mockResolvedValue(createProduct('product-1', 3));

        const result = await new OrderDomainService(repo).checkStockAvailability(productId(), Quantity.create(5));

        expect(result).toBe(false);
      });
    });

    context('when 商品が見つからない', () => {
      it('falseを返す', async () => {
        const repo = mockRepo();
        repo.findById.mockResolvedValue(null);

        const result = await new OrderDomainService(repo).checkStockAvailability(productId(), Quantity.create(5));

        expect(result).toBe(false);
      });
    });
  });
});
