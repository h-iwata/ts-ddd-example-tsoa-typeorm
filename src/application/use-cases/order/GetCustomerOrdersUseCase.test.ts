import { GetCustomerOrdersUseCase } from './GetCustomerOrdersUseCase';
import { IOrderRepository } from '../../../domain/repositories';
import { orderFactory } from '../../../test/factories';

describe('GetCustomerOrdersUseCase', () => {
  let useCase: GetCustomerOrdersUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetCustomerOrdersUseCase(mockOrderRepository);
  });

  it('顧客の注文一覧を取得できる', async () => {
    const orders = orderFactory.buildList(2, {}, { transient: { customerId: 'customer-123' } });
    mockOrderRepository.findByCustomerId.mockResolvedValue(orders);

    const result = await useCase.execute('customer-123');

    expect(result).toHaveLength(2);
  });

  it('注文がない場合は空配列を返す', async () => {
    mockOrderRepository.findByCustomerId.mockResolvedValue([]);

    const result = await useCase.execute('customer-123');

    expect(result).toHaveLength(0);
  });
});
