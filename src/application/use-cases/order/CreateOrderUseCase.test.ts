import { CustomerNotFoundError } from '../../../domain/aggregates/customer/errors';
import { type ICustomerRepository, type IOrderRepository } from '../../../domain/repositories';
import { customerFactory } from '../../../test/factories';
import { CreateOrderUseCase } from './CreateOrderUseCase';

describe('CreateOrderUseCase', () => {
  const mockOrderRepo = (): jest.Mocked<IOrderRepository> => ({
    findById: jest.fn(),
    findByCustomerId: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });
  const mockCustomerRepo = (): jest.Mocked<ICustomerRepository> => ({
    findById: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  it('注文を作成する', async () => {
    const orderRepo = mockOrderRepo();
    const customerRepo = mockCustomerRepo();
    const customer = customerFactory.build();
    customerRepo.findById.mockResolvedValue(customer);

    const result = await new CreateOrderUseCase(orderRepo, customerRepo).execute({
      customerId: customer.getId().getValue(),
    });

    expect(result.customerId).toBe(customer.getId().getValue());
    expect(result.status).toBe('PENDING');
    expect(orderRepo.save).toHaveBeenCalled();
  });

  context('with 顧客の配送先', () => {
    it('注文にも設定する', async () => {
      const orderRepo = mockOrderRepo();
      const customerRepo = mockCustomerRepo();
      const customer = customerFactory.build({}, { transient: { withAddress: true } });
      customerRepo.findById.mockResolvedValue(customer);

      const result = await new CreateOrderUseCase(orderRepo, customerRepo).execute({
        customerId: customer.getId().getValue(),
      });

      expect(result.shippingAddress?.postalCode).toBe('100-0001');
    });
  });

  context('when 顧客が見つからない', () => {
    it('エラーを投げる', async () => {
      const customerRepo = mockCustomerRepo();
      customerRepo.findById.mockResolvedValue(null);

      await expect(new CreateOrderUseCase(mockOrderRepo(), customerRepo).execute({ customerId: 'x' })).rejects.toThrow(
        CustomerNotFoundError
      );
    });
  });
});
