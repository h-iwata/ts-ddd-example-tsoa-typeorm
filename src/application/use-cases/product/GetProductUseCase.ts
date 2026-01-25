import { injectable, inject } from 'inversify';
import { ProductNotFoundError } from '../../../domain/aggregates/product/errors';
import { IProductRepository } from '../../../domain/repositories';
import { ProductId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { ProductResponseDto, toProductResponseDto } from '../../dtos';

@injectable()
export class GetProductUseCase {
  constructor(
    @inject(TYPES.IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  async execute(productId: string): Promise<ProductResponseDto> {
    const id = ProductId.fromString(productId);
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return toProductResponseDto(product);
  }
}
