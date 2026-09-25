import { inject, injectable } from 'inversify';
import { OrderStatus } from '../../../domain/aggregates/order';
import { type IOrderRepository, type ITransactionManager } from '../../../domain/repositories';
import { type OrderDomainService } from '../../../domain/services';
import { OrderId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type OrderResponseDto, toOrderResponseDto } from '../../dtos';

@injectable()
export class CancelOrderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @inject(TYPES.OrderDomainService)
    private readonly orderDomainService: OrderDomainService,
    @inject(TYPES.ITransactionManager)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(orderId: string): Promise<OrderResponseDto> {
    const id = OrderId.fromString(orderId);
    // 途中で失敗したときに在庫だけが戻った状態にならないよう、同一トランザクションで囲む
    return this.transactionManager.run(async () => {
      const order = await this.orderRepository.findByIdForUpdateOrFail(id);
      // PENDINGはまだ引き当てていないので戻す在庫がない
      const needsStockRelease = order.getStatus() === OrderStatus.CONFIRMED || order.getStatus() === OrderStatus.PAID;
      order.cancel();
      if (needsStockRelease) {
        await this.orderDomainService.releaseStock(order);
      }
      await this.orderRepository.save(order);

      return toOrderResponseDto(order);
    });
  }
}
