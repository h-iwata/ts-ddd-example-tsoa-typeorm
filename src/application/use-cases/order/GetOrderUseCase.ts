import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { OrderNotFoundError } from '../../../shared/errors';
import { OrderResponseDto, toOrderResponseDto } from '../../dtos';

@injectable()
export class GetOrderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(orderId: string): Promise<OrderResponseDto> {
    const id = OrderId.fromString(orderId);
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    return toOrderResponseDto(order);
  }
}
