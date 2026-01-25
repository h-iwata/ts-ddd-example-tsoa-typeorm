import { injectable, inject } from 'inversify';
import { Product } from '../../../domain/aggregates/product';
import { IProductRepository } from '../../../domain/repositories';
import { Money, Quantity } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import {
  CreateProductDto,
  ProductResponseDto,
  toProductResponseDto,
} from '../../dtos';

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(TYPES.IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductResponseDto> {
    const price = Money.create(dto.price, dto.currency ?? 'JPY');
    const stock = Quantity.create(dto.initialStock);

    const product = Product.create(dto.name, dto.description, price, stock);

    await this.productRepository.save(product);

    return toProductResponseDto(product);
  }
}
