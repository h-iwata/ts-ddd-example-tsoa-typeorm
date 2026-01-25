import { GetProductUseCase } from './GetProductUseCase';
import { IProductRepository } from '../../../domain/repositories';
import { ProductNotFoundError } from '../../../shared/errors';
import { productFactory } from '../../../test/factories';

describe('GetProductUseCase', () => {
  const mockRepo = (): jest.Mocked<IProductRepository> => ({
    findById: jest.fn(),
    findByIds: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  it('商品を取得する', async () => {
    const repo = mockRepo();
    const product = productFactory.build();
    repo.findById.mockResolvedValue(product);

    const result = await new GetProductUseCase(repo).execute(product.getId().getValue());

    expect(result.id).toBe(product.getId().getValue());
    expect(result.name).toBe(product.getName());
  });

  context('when 見つからない', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.findById.mockResolvedValue(null);

      await expect(new GetProductUseCase(repo).execute('not-found'))
        .rejects.toThrow(ProductNotFoundError);
    });
  });
});
