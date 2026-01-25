import { injectable, inject } from 'inversify';
import { IOrderRepository, IProductRepository } from '../../../domain/repositories';
import { OrderId, ProductId, Quantity } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { OrderNotFoundError, ProductNotFoundError } from '../../../shared/errors';
import {
  AddOrderItemDto,
  OrderResponseDto,
  toOrderResponseDto,
} from '../../dtos';

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

  async execute(
    orderId: string,
    dto: AddOrderItemDto
  ): Promise<OrderResponseDto> {
    const orderIdVo = OrderId.fromString(orderId);
    const productId = ProductId.fromString(dto.productId);
    const quantity = Quantity.create(dto.quantity);

    // 注文を取得
    const order = await this.orderRepository.findById(orderIdVo);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    // 商品を取得（価格と名前を取得するため）
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(dto.productId);
    }

    // 注文に商品を追加
    // この時点では在庫は減らさない（確定時に減らす）
    order.addItem(
      productId,
      product.getName(),
      product.getPrice(),
      quantity
    );

    await this.orderRepository.save(order);

    return toOrderResponseDto(order);
  }
}
