import { GetCustomerOrdersUseCase } from './GetCustomerOrdersUseCase';
import { IOrderRepository } from '../../../domain/repositories';
import { orderFactory } from '../../../test/factories';

describe('GetCustomerOrdersUseCase', () => {
  const mockRepo = (): jest.Mocked<IOrderRepository> => ({
    findById: jest.fn(), findByCustomerId: jest.fn(), findAll: jest.fn(), save: jest.fn(), delete: jest.fn(),
  });

  it('顧客の注文一覧を取得する', async () => {
    const repo = mockRepo();
    repo.findByCustomerId.mockResolvedValue(orderFactory.buildList(2));

    const result = await new GetCustomerOrdersUseCase(repo).execute('customer-1');

    expect(result).toHaveLength(2);
  });

  context('when 注文なし', () => {
    it('空配列を返す', async () => {
      const repo = mockRepo();
      repo.findByCustomerId.mockResolvedValue([]);

      const result = await new GetCustomerOrdersUseCase(repo).execute('customer-1');

      expect(result).toHaveLength(0);
    });
  });
});
