import { ProductNotFoundError } from '../../../domain/aggregates/product/errors';
import { type IProductRepository } from '../../../domain/repositories';
import { productFactory } from '../../../test/factories';
import { GetProductUseCase } from './GetProductUseCase';

describe('GetProductUseCase', () => {
  const mockRepo = (): jest.Mocked<IProductRepository> => ({
    findById: jest.fn(),
    findByIdOrFail: jest.fn(),
    findByIds: jest.fn(),
    findByIdsForUpdate: jest.fn(),
    findAll: jest.fn(),
    add: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  it('商品を取得する', async () => {
    const repo = mockRepo();
    const product = productFactory.build();
    repo.findByIdOrFail.mockResolvedValue(product);

    const result = await new GetProductUseCase(repo).execute(product.getId().getValue());

    expect(result.id).toBe(product.getId().getValue());
    expect(result.name).toBe(product.getName());
  });

  context('when 見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findByIdOrFail.mockRejectedValue(new ProductNotFoundError('x'));

      await expect(new GetProductUseCase(repo).execute('not-found')).rejects.toThrow(ProductNotFoundError);
    });
  });
});
