import { CreateOrderUseCase } from './CreateOrderUseCase';
import { IOrderRepository, ICustomerRepository } from '../../../domain/repositories';
import { CustomerNotFoundError } from '../../../shared/errors';
import { customerFactory } from '../../../test/factories';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockCustomerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateOrderUseCase(mockOrderRepository, mockCustomerRepository);
  });

  it('注文を作成できる', async () => {
    const customer = customerFactory.build();
    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockOrderRepository.save.mockResolvedValue();

    const result = await useCase.execute({
      customerId: customer.getId().getValue(),
    });

    expect(result.customerId).toBe(customer.getId().getValue());
    expect(result.status).toBe('PENDING');
    expect(result.items).toHaveLength(0);
    expect(mockOrderRepository.save).toHaveBeenCalled();
  });

  it('顧客に配送先が設定されていれば注文にも設定される', async () => {
    const customer = customerFactory.build({}, { transient: { withAddress: true } });
    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockOrderRepository.save.mockResolvedValue();

    const result = await useCase.execute({
      customerId: customer.getId().getValue(),
    });

    expect(result.shippingAddress).toBeDefined();
    expect(result.shippingAddress?.postalCode).toBe('100-0001');
  });

  it('顧客が見つからない場合はエラー', async () => {
    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        customerId: 'non-existent',
      })
    ).rejects.toThrow(CustomerNotFoundError);
  });
});
