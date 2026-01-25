import { GetOrderUseCase } from './GetOrderUseCase';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderNotFoundError } from '../../../shared/errors';
import { orderFactory } from '../../../test/factories';

describe('GetOrderUseCase', () => {
  let useCase: GetOrderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetOrderUseCase(mockOrderRepository);
  });

  it('注文を取得できる', async () => {
    const order = orderFactory.build();
    mockOrderRepository.findById.mockResolvedValue(order);

    const result = await useCase.execute(order.getId().getValue());

    expect(result.id).toBe(order.getId().getValue());
    expect(result.customerId).toBe(order.getCustomerId().getValue());
    expect(result.status).toBe('PENDING');
  });

  it('注文が見つからない場合はエラー', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      OrderNotFoundError
    );
  });
});
