import { GetAllProductsUseCase } from './GetAllProductsUseCase';
import { IProductRepository } from '../../../domain/repositories';
import { Product, ProductId } from '../../../domain/aggregates/product';
import { Money, Quantity } from '../../../domain/shared/value-objects';

describe('GetAllProductsUseCase', () => {
  let useCase: GetAllProductsUseCase;
  let mockProductRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetAllProductsUseCase(mockProductRepository);
  });

  const createTestProduct = (id: string, name: string): Product => {
    return Product.reconstruct(
      ProductId.fromString(id),
      name,
      '説明',
      Money.create(1000),
      Quantity.create(10),
      new Date(),
      new Date()
    );
  };

  it('全商品を取得できる', async () => {
    const products = [
      createTestProduct('product-1', '商品1'),
      createTestProduct('product-2', '商品2'),
    ];
    mockProductRepository.findAll.mockResolvedValue(products);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('product-1');
    expect(result[1].id).toBe('product-2');
  });

  it('商品がない場合は空配列を返す', async () => {
    mockProductRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });
});
