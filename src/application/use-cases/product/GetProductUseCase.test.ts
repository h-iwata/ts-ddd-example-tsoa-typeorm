import { GetProductUseCase } from './GetProductUseCase';
import { IProductRepository } from '../../../domain/repositories';
import { Product, ProductId } from '../../../domain/aggregates/product';
import { Money, Quantity } from '../../../domain/shared/value-objects';
import { ProductNotFoundError } from '../../../shared/errors';

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
  let mockProductRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetProductUseCase(mockProductRepository);
  });

  const createTestProduct = (): Product => {
    return Product.reconstruct(
      ProductId.fromString('product-1'),
      'テスト商品',
      '説明',
      Money.create(1000),
      Quantity.create(10),
      new Date('2024-01-01'),
      new Date('2024-01-02')
    );
  };

  it('商品を取得できる', async () => {
    const product = createTestProduct();
    mockProductRepository.findById.mockResolvedValue(product);

    const result = await useCase.execute('product-1');

    expect(result.id).toBe('product-1');
    expect(result.name).toBe('テスト商品');
    expect(mockProductRepository.findById).toHaveBeenCalled();
  });

  it('商品が見つからない場合はエラー', async () => {
    mockProductRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      ProductNotFoundError
    );
  });
});
