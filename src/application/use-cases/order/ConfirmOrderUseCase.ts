import { inject, injectable } from 'inversify';
import { type IOrderRepository, type ITransactionManager } from '../../../domain/repositories';
import { type OrderDomainService } from '../../../domain/services';
import { OrderId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type OrderResponseDto, toOrderResponseDto } from '../../dtos';

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
    // 途中で失敗したときに在庫だけが減った状態にならないよう、確定と引き当てを同一トランザクションで囲む
    return this.transactionManager.run(async () => {
      const order = await this.orderRepository.findByIdForUpdateOrFail(id);
      // 書き込みの前に注文側のルールを検証する
      order.confirm();

      // Order集約とProduct集約の整合性を保つ
      await this.orderDomainService.validateAndReserveStock(order);
      await this.orderRepository.save(order);

      return toOrderResponseDto(order);
    });
  }
}
