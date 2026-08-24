import { inject, injectable } from 'inversify';
import { type IProductRepository } from '../../../domain/repositories';
import { TYPES } from '../../../infrastructure/di/types';
import { type ProductResponseDto, toProductResponseDto } from '../../dtos';

@injectable()
export class GetAllProductsUseCase {
  constructor(
    @inject(TYPES.IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  async execute(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findAll();
    return products.map(toProductResponseDto);
  }
}
