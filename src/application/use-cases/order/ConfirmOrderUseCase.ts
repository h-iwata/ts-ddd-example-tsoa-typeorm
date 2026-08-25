import { inject, injectable } from 'inversify';
import { OrderNotFoundError } from '../../../domain/aggregates/order/errors';
import { type IOrderRepository, type ITransactionManager } from '../../../domain/repositories';
import { type OrderDomainService } from '../../../domain/services';
import { OrderId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type OrderResponseDto, toOrderResponseDto } from '../../dtos';

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
    private readonly orderDomainService: OrderDomainService,
    @inject(TYPES.ITransactionManager)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(orderId: string): Promise<OrderResponseDto> {
    const id = OrderId.fromString(orderId);

    // 在庫の引き当てと注文の確定は同一トランザクションで行う。
    // 途中で失敗した場合に在庫だけが減った状態にならないようにする。
    return this.transactionManager.run(async () => {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      // 書き込みの前に注文側のルールを検証する
      order.confirm();

      // 在庫チェック & 引き当て（Order集約とProduct集約の整合性を保つ）
      await this.orderDomainService.validateAndReserveStock(order);
      await this.orderRepository.save(order);

      return toOrderResponseDto(order);
    });
  }
}
