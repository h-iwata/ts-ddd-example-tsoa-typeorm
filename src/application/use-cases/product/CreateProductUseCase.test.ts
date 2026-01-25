import { type IProductRepository } from '../../../domain/repositories';
import { CreateProductUseCase } from './CreateProductUseCase';

describe('CreateProductUseCase', () => {
  const mockRepo = (): jest.Mocked<IProductRepository> => ({
    findById: jest.fn(),
    findByIds: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  const dto = { name: 'テスト商品', description: '説明', price: 1000, initialStock: 10 };

  it('商品を作成する', async () => {
    const repo = mockRepo();
    const result = await new CreateProductUseCase(repo).execute(dto);

    expect(result.name).toBe('テスト商品');
    expect(result.price).toBe(1000);
    expect(result.stock).toBe(10);
    expect(repo.save).toHaveBeenCalled();
  });

  it('通貨を指定できる', async () => {
    const result = await new CreateProductUseCase(mockRepo())
      .execute({ ...dto, currency: 'USD' });

    expect(result.currency).toBe('USD');
  });
});
