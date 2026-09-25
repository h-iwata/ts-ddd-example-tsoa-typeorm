import { OrderNotFoundError } from '../../../domain/aggregates/order/errors';
import { type IOrderRepository } from '../../../domain/repositories';
import { type OrderDomainService } from '../../../domain/services';
import { confirmedOrderFactory, orderFactory, paidOrderFactory } from '../../../test/factories';
import { stubTransactionManager } from '../../../test/helpers';
import { CancelOrderUseCase } from './CancelOrderUseCase';

describe('CancelOrderUseCase', () => {
  const mockRepo = (): jest.Mocked<IOrderRepository> => ({
    findById: jest.fn(),
    findByIdOrFail: jest.fn(),
    findByIdForUpdateOrFail: jest.fn(),
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

  context('when PENDING状態', () => {
    it('キャンセルする（在庫戻しなし）', async () => {
      const repo = mockRepo();
      const service = mockService();
      repo.findByIdForUpdateOrFail.mockResolvedValue(orderFactory.build());

      const result = await new CancelOrderUseCase(repo, service, stubTransactionManager()).execute('order-1');

      expect(result.status).toBe('CANCELLED');
      expect(service.releaseStock).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
    });
  });

  context('when CONFIRMED状態', () => {
    it('キャンセルして在庫を戻す', async () => {
      const repo = mockRepo();
      const service = mockService();
      const order = confirmedOrderFactory.build();
      repo.findByIdForUpdateOrFail.mockResolvedValue(order);

      const result = await new CancelOrderUseCase(repo, service, stubTransactionManager()).execute(order.getId().getValue());

      expect(result.status).toBe('CANCELLED');
      expect(service.releaseStock).toHaveBeenCalledWith(order);
    });
  });

  context('when PAID状態', () => {
    it('キャンセルして在庫を戻す', async () => {
      const repo = mockRepo();
      const service = mockService();
      const order = paidOrderFactory.build();
      repo.findByIdForUpdateOrFail.mockResolvedValue(order);

      const result = await new CancelOrderUseCase(repo, service, stubTransactionManager()).execute(order.getId().getValue());

      expect(result.status).toBe('CANCELLED');
      expect(service.releaseStock).toHaveBeenCalledWith(order);
    });
  });

  context('when 注文が見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findByIdForUpdateOrFail.mockRejectedValue(new OrderNotFoundError('x'));

      await expect(new CancelOrderUseCase(repo, mockService(), stubTransactionManager()).execute('x')).rejects.toThrow(OrderNotFoundError);
    });
  });
});
