import { GetAllProductsUseCase } from './GetAllProductsUseCase';
import { IProductRepository } from '../../../domain/repositories';
import { productFactory } from '../../../test/factories';

describe('GetAllProductsUseCase', () => {
  const mockRepo = (): jest.Mocked<IProductRepository> => ({
    findById: jest.fn(),
    findByIds: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  it('全商品を取得する', async () => {
    const repo = mockRepo();
    repo.findAll.mockResolvedValue(productFactory.buildList(2));

    const result = await new GetAllProductsUseCase(repo).execute();

    expect(result).toHaveLength(2);
  });

  context('when 商品なし', () => {
    it('空配列を返す', async () => {
      const repo = mockRepo();
      repo.findAll.mockResolvedValue([]);

      const result = await new GetAllProductsUseCase(repo).execute();

      expect(result).toHaveLength(0);
    });
  });
});
