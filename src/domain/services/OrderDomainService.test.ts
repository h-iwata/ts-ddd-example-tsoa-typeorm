import { OrderDomainService } from './OrderDomainService';
import { Order } from '../aggregates/order';
import { Product } from '../aggregates/product';
import { ProductId } from '../aggregates/product/ProductId';
import { CustomerId } from '../aggregates/customer/CustomerId';
import { IProductRepository } from '../repositories';
import { Money, Quantity, Address } from '../shared/value-objects';
import { InsufficientStockError } from '../aggregates/order/errors';
import { ProductNotFoundError } from '../aggregates/product/errors';

describe('OrderDomainService', () => {
  let service: OrderDomainService;
  let mockProductRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    service = new OrderDomainService(mockProductRepository);
  });

  const createTestProduct = (
    id: string,
    stock: number
  ): Product => {
    return Product.reconstruct(
      ProductId.fromString(id),
      'テスト商品',
      '説明',
      Money.create(1000),
      Quantity.create(stock),
      new Date(),
      new Date()
    );
  };

  const createTestOrder = (): Order => {
    const order = Order.create(CustomerId.fromString('customer-1'));
    order.addItem(
      ProductId.fromString('product-1'),
      '商品1',
      Money.create(1000),
      Quantity.create(2)
    );
    order.setShippingAddress(
      Address.create('100-0001', '東京都', '千代田区', '1-1-1')
    );
    return order;
  };

  describe('validateAndReserveStock', () => {
    it('在庫が十分な場合は成功する', async () => {
      const order = createTestOrder();
      const product = createTestProduct('product-1', 10);

      mockProductRepository.findByIds.mockResolvedValue([product]);
      mockProductRepository.save.mockResolvedValue();

      await service.validateAndReserveStock(order);

      expect(mockProductRepository.findByIds).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(product.getStock().getValue()).toBe(8); // 10 - 2
    });

    it('商品が見つからない場合はエラー', async () => {
      const order = createTestOrder();

      mockProductRepository.findByIds.mockResolvedValue([]);

      await expect(service.validateAndReserveStock(order)).rejects.toThrow(
        ProductNotFoundError
      );
    });

    it('在庫が不足している場合はエラー', async () => {
      const order = createTestOrder();
      const product = createTestProduct('product-1', 1); // 在庫1、注文は2

      mockProductRepository.findByIds.mockResolvedValue([product]);

      await expect(service.validateAndReserveStock(order)).rejects.toThrow(
        InsufficientStockError
      );
    });

    it('複数商品の注文でも正しく処理される', async () => {
      const order = Order.create(CustomerId.fromString('customer-1'));
      order.addItem(
        ProductId.fromString('product-1'),
        '商品1',
        Money.create(1000),
        Quantity.create(2)
      );
      order.addItem(
        ProductId.fromString('product-2'),
        '商品2',
        Money.create(500),
        Quantity.create(3)
      );
      order.setShippingAddress(
        Address.create('100-0001', '東京都', '千代田区', '1-1-1')
      );

      const product1 = createTestProduct('product-1', 10);
      const product2 = createTestProduct('product-2', 10);

      mockProductRepository.findByIds.mockResolvedValue([product1, product2]);
      mockProductRepository.save.mockResolvedValue();

      await service.validateAndReserveStock(order);

      expect(product1.getStock().getValue()).toBe(8);
      expect(product2.getStock().getValue()).toBe(7);
      expect(mockProductRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('releaseStock', () => {
    it('在庫を戻すことができる', async () => {
      const order = createTestOrder();
      const product = createTestProduct('product-1', 5);

      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue();

      await service.releaseStock(order);

      expect(product.getStock().getValue()).toBe(7); // 5 + 2
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('商品が見つからない場合でもエラーにならない', async () => {
      const order = createTestOrder();

      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.releaseStock(order)).resolves.not.toThrow();
    });
  });

  describe('checkStockAvailability', () => {
    it('在庫が十分な場合は true', async () => {
      const product = createTestProduct('product-1', 10);
      mockProductRepository.findById.mockResolvedValue(product);

      const result = await service.checkStockAvailability(
        ProductId.fromString('product-1'),
        Quantity.create(5)
      );

      expect(result).toBe(true);
    });

    it('在庫が不足している場合は false', async () => {
      const product = createTestProduct('product-1', 3);
      mockProductRepository.findById.mockResolvedValue(product);

      const result = await service.checkStockAvailability(
        ProductId.fromString('product-1'),
        Quantity.create(5)
      );

      expect(result).toBe(false);
    });

    it('商品が見つからない場合は false', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await service.checkStockAvailability(
        ProductId.fromString('product-1'),
        Quantity.create(5)
      );

      expect(result).toBe(false);
    });
  });
});
