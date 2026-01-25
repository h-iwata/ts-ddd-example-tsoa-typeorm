import { injectable, inject } from 'inversify';
import { OrderNotFoundError } from '../../../domain/aggregates/order/errors';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderDomainService } from '../../../domain/services';
import { OrderId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { OrderResponseDto, toOrderResponseDto } from '../../dtos';

/**
 * 注文を確定するユースケース
 * ドメインサービスを使って在庫の引き当てを行う
 */
@injectable()
export class ConfirmOrderUseCase {
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

    // 在庫チェック & 引き当て（ドメインサービス）
    // これにより、Order集約とProduct集約の整合性が保たれる
    await this.orderDomainService.validateAndReserveStock(order);

    // 注文を確定
    order.confirm();

    await this.orderRepository.save(order);

    return toOrderResponseDto(order);
  }
}
