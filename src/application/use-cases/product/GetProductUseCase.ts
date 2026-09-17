import { inject, injectable } from 'inversify';
import { ProductNotFoundError } from '../../../domain/aggregates/product/errors';
import { type IProductRepository } from '../../../domain/repositories';
import { ProductId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type ProductResponseDto, toProductResponseDto } from '../../dtos';

@injectable()
export class GetProductUseCase {
  constructor(
    @inject(TYPES.IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  async execute(productId: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(ProductId.fromString(productId));
    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return toProductResponseDto(product);
  }
}
