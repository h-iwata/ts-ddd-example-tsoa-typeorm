import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { OrderId } from '../../../domain/value-objects';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderDomainService } from '../../../domain/services';
import { OrderStatus } from '../../../domain/aggregates/order';
import { OrderResponseDto, toOrderResponseDto } from '../../dtos';
import { OrderNotFoundError } from '../../../shared/errors';

/**
 * 注文をキャンセルするユースケース
 * 確定後のキャンセルは在庫を戻す
 */
@injectable()
export class CancelOrderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @inject(TYPES.OrderDomainService)
    private readonly orderDomainService: OrderDomainService
  ) {}

  async execute(orderId: string): Promise<OrderResponseDto> {
    const id = OrderId.fromString(orderId);

    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    // 確定後のキャンセルは在庫を戻す
    const needsStockRelease =
      order.getStatus() === OrderStatus.CONFIRMED ||
      order.getStatus() === OrderStatus.PAID;

    if (needsStockRelease) {
      await this.orderDomainService.releaseStock(order);
    }

    order.cancel();

    await this.orderRepository.save(order);

    return toOrderResponseDto(order);
  }
}
