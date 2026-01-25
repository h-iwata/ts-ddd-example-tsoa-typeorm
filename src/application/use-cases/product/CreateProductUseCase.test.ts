import { CreateProductUseCase } from './CreateProductUseCase';
import { IProductRepository } from '../../../domain/repositories';
import { Product } from '../../../domain/aggregates/product';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockProductRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateProductUseCase(mockProductRepository);
  });

  it('商品を作成できる', async () => {
    mockProductRepository.save.mockResolvedValue();

    const result = await useCase.execute({
      name: 'テスト商品',
      description: '説明文',
      price: 1000,
      initialStock: 10,
    });

    expect(result.name).toBe('テスト商品');
    expect(result.description).toBe('説明文');
    expect(result.price).toBe(1000);
    expect(result.currency).toBe('JPY');
    expect(result.stock).toBe(10);
    expect(result.id).toBeDefined();
    expect(mockProductRepository.save).toHaveBeenCalled();
  });

  it('通貨を指定して商品を作成できる', async () => {
    mockProductRepository.save.mockResolvedValue();

    const result = await useCase.execute({
      name: 'テスト商品',
      description: '説明文',
      price: 100,
      currency: 'USD',
      initialStock: 5,
    });

    expect(result.currency).toBe('USD');
  });
});
