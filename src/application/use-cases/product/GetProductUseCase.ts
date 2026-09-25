import { inject, injectable } from 'inversify';
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
    const product = await this.productRepository.findByIdOrFail(ProductId.fromString(productId));

    return toProductResponseDto(product);
  }
}
