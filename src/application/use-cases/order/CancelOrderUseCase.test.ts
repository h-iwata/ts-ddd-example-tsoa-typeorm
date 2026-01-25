import { CancelOrderUseCase } from './CancelOrderUseCase';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderDomainService } from '../../../domain/services';
import { OrderNotFoundError } from '../../../shared/errors';
import { orderFactory, confirmedOrderFactory, paidOrderFactory } from '../../../test/factories';

describe('CancelOrderUseCase', () => {
  const mockRepo = (): jest.Mocked<IOrderRepository> => ({
    findById: jest.fn(), findByCustomerId: jest.fn(), findAll: jest.fn(), save: jest.fn(), delete: jest.fn(),
  });
  const mockService = (): jest.Mocked<OrderDomainService> => ({
    validateAndReserveStock: jest.fn(), releaseStock: jest.fn(), checkStockAvailability: jest.fn(),
  }) as unknown as jest.Mocked<OrderDomainService>;

  context('when PENDING状態', () => {
    it('キャンセルする（在庫戻しなし）', async () => {
      const repo = mockRepo();
      const service = mockService();
      repo.findById.mockResolvedValue(orderFactory.build());

      const result = await new CancelOrderUseCase(repo, service).execute('order-1');

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
      repo.findById.mockResolvedValue(order);

      const result = await new CancelOrderUseCase(repo, service).execute(order.getId().getValue());

      expect(result.status).toBe('CANCELLED');
      expect(service.releaseStock).toHaveBeenCalledWith(order);
    });
  });

  context('when PAID状態', () => {
    it('キャンセルして在庫を戻す', async () => {
      const repo = mockRepo();
      const service = mockService();
      const order = paidOrderFactory.build();
      repo.findById.mockResolvedValue(order);

      const result = await new CancelOrderUseCase(repo, service).execute(order.getId().getValue());

      expect(result.status).toBe('CANCELLED');
      expect(service.releaseStock).toHaveBeenCalledWith(order);
    });
  });

  context('when 注文が見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findById.mockResolvedValue(null);

      await expect(new CancelOrderUseCase(repo, mockService()).execute('x'))
        .rejects.toThrow(OrderNotFoundError);
    });
  });
});
