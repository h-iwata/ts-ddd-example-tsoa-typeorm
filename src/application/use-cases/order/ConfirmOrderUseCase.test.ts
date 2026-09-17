import { OrderNotFoundError } from '../../../domain/aggregates/order/errors';
import { type IOrderRepository } from '../../../domain/repositories';
import { type OrderDomainService } from '../../../domain/services';
import { orderFactory } from '../../../test/factories';
import { stubTransactionManager } from '../../../test/helpers';
import { ConfirmOrderUseCase } from './ConfirmOrderUseCase';

describe('ConfirmOrderUseCase', () => {
  const mockRepo = (): jest.Mocked<IOrderRepository> => ({
    findById: jest.fn(),
    findByCustomerId: jest.fn(),
    findAll: jest.fn(),
    add: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });
  const mockService = (): jest.Mocked<OrderDomainService> =>
    ({
      validateAndReserveStock: jest.fn(),
      releaseStock: jest.fn(),
      checkStockAvailability: jest.fn(),
    }) as unknown as jest.Mocked<OrderDomainService>;

  it('注文を確定する', async () => {
    const repo = mockRepo();
    const service = mockService();
    const order = orderFactory.build({}, { transient: { withItems: true, withAddress: true } });
    repo.findById.mockResolvedValue(order);

    const result = await new ConfirmOrderUseCase(repo, service, stubTransactionManager()).execute(order.getId().getValue());

    expect(result.status).toBe('CONFIRMED');
    expect(service.validateAndReserveStock).toHaveBeenCalledWith(order);
    expect(repo.save).toHaveBeenCalled();
  });

  context('when 注文が見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findById.mockResolvedValue(null);

      await expect(new ConfirmOrderUseCase(repo, mockService(), stubTransactionManager()).execute('x')).rejects.toThrow(OrderNotFoundError);
    });
  });

  context('when 在庫引き当て失敗', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      const service = mockService();
      const order = orderFactory.build({}, { transient: { withItems: true, withAddress: true } });
      repo.findById.mockResolvedValue(order);
      service.validateAndReserveStock.mockRejectedValue(new Error('在庫不足'));

      await expect(new ConfirmOrderUseCase(repo, service, stubTransactionManager()).execute(order.getId().getValue())).rejects.toThrow(
        '在庫不足'
      );
    });
  });
});
