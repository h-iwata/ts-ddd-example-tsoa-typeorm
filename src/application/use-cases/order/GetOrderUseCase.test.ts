import { OrderNotFoundError } from '../../../domain/aggregates/order/errors';
import { type IOrderRepository } from '../../../domain/repositories';
import { orderFactory } from '../../../test/factories';
import { GetOrderUseCase } from './GetOrderUseCase';

describe('GetOrderUseCase', () => {
  const mockRepo = (): jest.Mocked<IOrderRepository> => ({
    findById: jest.fn(),
    findByCustomerId: jest.fn(),
    findAll: jest.fn(),
    add: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  it('注文を取得する', async () => {
    const repo = mockRepo();
    const order = orderFactory.build();
    repo.findById.mockResolvedValue(order);

    const result = await new GetOrderUseCase(repo).execute(order.getId().getValue());

    expect(result.id).toBe(order.getId().getValue());
    expect(result.status).toBe('PENDING');
  });

  context('when 見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findById.mockResolvedValue(null);

      await expect(new GetOrderUseCase(repo).execute('not-found')).rejects.toThrow(OrderNotFoundError);
    });
  });
});
