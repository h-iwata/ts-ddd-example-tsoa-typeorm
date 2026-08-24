import { inject, injectable } from 'inversify';
import { OrderNotFoundError } from '../../../domain/aggregates/order/errors';
import { ProductNotFoundError } from '../../../domain/aggregates/product/errors';
import { type IOrderRepository, type IProductRepository } from '../../../domain/repositories';
import { OrderId, ProductId, Quantity } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type AddOrderItemDto, type OrderResponseDto, toOrderResponseDto } from '../../dtos';

/**
 * 注文に商品を追加するユースケース
 * Order集約とProduct集約の両方を操作する
 */
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

    const order = await this.orderRepository.findById(OrderId.fromString(orderId));
    if (!order) throw new OrderNotFoundError(orderId);

    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundError(dto.productId);

    order.addItem(productId, product.getName(), product.getPrice(), Quantity.create(dto.quantity));
    await this.orderRepository.save(order);
    return toOrderResponseDto(order);
  }
}
