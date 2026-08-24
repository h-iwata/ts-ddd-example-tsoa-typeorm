import { inject, injectable } from 'inversify';
import { Product } from '../../../domain/aggregates/product';
import { type IProductRepository } from '../../../domain/repositories';
import { Money, Quantity } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type CreateProductDto, type ProductResponseDto, toProductResponseDto } from '../../dtos';

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
