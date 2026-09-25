import { inject, injectable } from 'inversify';
import { type IOrderRepository, type IProductRepository } from '../../../domain/repositories';
import { OrderId, ProductId, Quantity } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type AddOrderItemDto, type OrderResponseDto, toOrderResponseDto } from '../../dtos';

@injectable()
export class AddOrderItemUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @inject(TYPES.IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  async execute(orderId: string, dto: AddOrderItemDto): Promise<OrderResponseDto> {
    const productId = ProductId.fromString(dto.productId);
    const order = await this.orderRepository.findByIdOrFail(OrderId.fromString(orderId));
    const product = await this.productRepository.findByIdOrFail(productId);

    order.addItem(productId, product.getName(), product.getPrice(), Quantity.create(dto.quantity));
    await this.orderRepository.save(order);
    return toOrderResponseDto(order);
  }
}
