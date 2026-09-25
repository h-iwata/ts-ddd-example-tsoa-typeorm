import { CustomerNotFoundError } from '../../../domain/aggregates/customer/errors';
import { type ICustomerRepository } from '../../../domain/repositories';
import { customerFactory } from '../../../test/factories';
import { SetCustomerAddressUseCase } from './SetCustomerAddressUseCase';

describe('SetCustomerAddressUseCase', () => {
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

  const addressDto = { postalCode: '100-0001', prefecture: '東京都', city: '千代田区', street: '1-1-1' };

  it('住所を設定する', async () => {
    const repo = mockRepo();
    const customer = customerFactory.build();
    repo.findByIdOrFail.mockResolvedValue(customer);

    const result = await new SetCustomerAddressUseCase(repo).execute(customer.getId().getValue(), addressDto);

    expect(result.shippingAddress?.postalCode).toBe('100-0001');
    expect(repo.save).toHaveBeenCalled();
  });

  it('建物名を含む住所を設定する', async () => {
    const repo = mockRepo();
    const customer = customerFactory.build();
    repo.findByIdOrFail.mockResolvedValue(customer);

    const result = await new SetCustomerAddressUseCase(repo).execute(customer.getId().getValue(), {
      ...addressDto,
      building: 'テストビル101',
    });

    expect(result.shippingAddress?.building).toBe('テストビル101');
  });

  context('when 見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findByIdOrFail.mockRejectedValue(new CustomerNotFoundError('x'));

      await expect(new SetCustomerAddressUseCase(repo).execute('not-found', addressDto)).rejects.toThrow(CustomerNotFoundError);
    });
  });
});
