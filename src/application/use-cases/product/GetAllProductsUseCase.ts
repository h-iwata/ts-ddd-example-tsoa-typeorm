import { injectable, inject } from 'inversify';
import { IProductRepository } from '../../../domain/repositories';
import { TYPES } from '../../../infrastructure/di/types';
import { ProductResponseDto, toProductResponseDto } from '../../dtos';

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
