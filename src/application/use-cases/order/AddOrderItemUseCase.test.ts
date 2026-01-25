import { AddOrderItemUseCase } from './AddOrderItemUseCase';
import { IOrderRepository, IProductRepository } from '../../../domain/repositories';
import { OrderNotFoundError, ProductNotFoundError } from '../../../shared/errors';
import { orderFactory, productFactory } from '../../../test/factories';

describe('AddOrderItemUseCase', () => {
  let useCase: AddOrderItemUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockProductRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new AddOrderItemUseCase(mockOrderRepository, mockProductRepository);
  });

  it('注文に商品を追加できる', async () => {
    const order = orderFactory.build();
    const product = productFactory.build();
    mockOrderRepository.findById.mockResolvedValue(order);
    mockProductRepository.findById.mockResolvedValue(product);
    mockOrderRepository.save.mockResolvedValue();

    const result = await useCase.execute(order.getId().getValue(), {
      productId: product.getId().getValue(),
      quantity: 2,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].productId).toBe(product.getId().getValue());
    expect(result.items[0].quantity).toBe(2);
    expect(mockOrderRepository.save).toHaveBeenCalled();
  });

  it('注文が見つからない場合はエラー', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', {
        productId: 'product-123',
        quantity: 2,
      })
    ).rejects.toThrow(OrderNotFoundError);
  });

  it('商品が見つからない場合はエラー', async () => {
    const order = orderFactory.build();
    mockOrderRepository.findById.mockResolvedValue(order);
    mockProductRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(order.getId().getValue(), {
        productId: 'non-existent',
        quantity: 2,
      })
    ).rejects.toThrow(ProductNotFoundError);
  });
});
