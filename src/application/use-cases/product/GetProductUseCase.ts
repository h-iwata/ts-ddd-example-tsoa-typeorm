import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { ProductId } from '../../../domain/value-objects';
import { IProductRepository } from '../../../domain/repositories';
import { ProductResponseDto, toProductResponseDto } from '../../dtos';
import { ProductNotFoundError } from '../../../shared/errors';

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
