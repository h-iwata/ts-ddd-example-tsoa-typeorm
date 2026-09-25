import { CustomerNotFoundError } from '../../../domain/aggregates/customer/errors';
import { type ICustomerRepository } from '../../../domain/repositories';
import { customerFactory } from '../../../test/factories';
import { GetCustomerUseCase } from './GetCustomerUseCase';

describe('GetCustomerUseCase', () => {
  const mockRepo = (): jest.Mocked<ICustomerRepository> => ({
    findById: jest.fn(),
    findByIdOrFail: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    findAll: jest.fn(),
    add: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  it('顧客を取得する', async () => {
    const repo = mockRepo();
    const customer = customerFactory.build();
    repo.findByIdOrFail.mockResolvedValue(customer);

    const result = await new GetCustomerUseCase(repo).execute(customer.getId().getValue());

    expect(result.id).toBe(customer.getId().getValue());
    expect(result.name).toBe(customer.getName());
  });

  context('when 見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findByIdOrFail.mockRejectedValue(new CustomerNotFoundError('x'));

      await expect(new GetCustomerUseCase(repo).execute('not-found')).rejects.toThrow(CustomerNotFoundError);
    });
  });
});
