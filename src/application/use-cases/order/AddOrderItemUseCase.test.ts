import { type IOrderRepository, type IProductRepository } from '../../../domain/repositories';
import { OrderNotFoundError, ProductNotFoundError } from '../../../shared/errors';
import { orderFactory, productFactory } from '../../../test/factories';
import { AddOrderItemUseCase } from './AddOrderItemUseCase';

describe('AddOrderItemUseCase', () => {
  const mockOrderRepo = (): jest.Mocked<IOrderRepository> => ({
    findById: jest.fn(), findByCustomerId: jest.fn(), findAll: jest.fn(), save: jest.fn(), delete: jest.fn(),
  });
  const mockProductRepo = (): jest.Mocked<IProductRepository> => ({
    findById: jest.fn(), findByIds: jest.fn(), findAll: jest.fn(), save: jest.fn(), delete: jest.fn(),
  });

  it('注文に商品を追加する', async () => {
    const orderRepo = mockOrderRepo();
    const productRepo = mockProductRepo();
    const order = orderFactory.build();
    const product = productFactory.build();
    orderRepo.findById.mockResolvedValue(order);
    productRepo.findById.mockResolvedValue(product);

    const result = await new AddOrderItemUseCase(orderRepo, productRepo)
      .execute(order.getId().getValue(), { productId: product.getId().getValue(), quantity: 2 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(2);
    expect(orderRepo.save).toHaveBeenCalled();
  });

  context('when 注文が見つからない', () => {
    it('エラーを投げる', async () => {
      const orderRepo = mockOrderRepo();
      orderRepo.findById.mockResolvedValue(null);

      await expect(new AddOrderItemUseCase(orderRepo, mockProductRepo()).execute('x', { productId: 'p', quantity: 1 }))
        .rejects.toThrow(OrderNotFoundError);
    });
  });

  context('when 商品が見つからない', () => {
    it('エラーを投げる', async () => {
      const orderRepo = mockOrderRepo();
      const productRepo = mockProductRepo();
      orderRepo.findById.mockResolvedValue(orderFactory.build());
      productRepo.findById.mockResolvedValue(null);

      await expect(new AddOrderItemUseCase(orderRepo, productRepo).execute('o', { productId: 'x', quantity: 1 }))
        .rejects.toThrow(ProductNotFoundError);
    });
  });
});
