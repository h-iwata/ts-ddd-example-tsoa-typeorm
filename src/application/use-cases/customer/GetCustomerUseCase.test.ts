import { GetCustomerUseCase } from './GetCustomerUseCase';
import { ICustomerRepository } from '../../../domain/repositories';
import { CustomerNotFoundError } from '../../../shared/errors';
import { customerFactory } from '../../../test/factories';

describe('GetCustomerUseCase', () => {
  let useCase: GetCustomerUseCase;
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>;

  beforeEach(() => {
    mockCustomerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetCustomerUseCase(mockCustomerRepository);
  });

  it('顧客を取得できる', async () => {
    const customer = customerFactory.build();
    mockCustomerRepository.findById.mockResolvedValue(customer);

    const result = await useCase.execute(customer.getId().getValue());

    expect(result.id).toBe(customer.getId().getValue());
    expect(result.name).toBe(customer.getName());
    expect(result.email).toBe(customer.getEmail().getValue());
  });

  it('顧客が見つからない場合はエラー', async () => {
    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      CustomerNotFoundError
    );
  });
});
