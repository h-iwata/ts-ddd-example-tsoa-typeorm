import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../../domain/repositories';
import { ProductId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { ProductNotFoundError } from '../../../shared/errors';
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
